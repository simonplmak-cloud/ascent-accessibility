import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assessRequestSchema } from "@/server/validation";
import { validateTargetUrl } from "@/server/ssrf";
import { IP_RATE_LIMIT, RATE_WINDOW_MS } from "@/server/rate-limit";
import { getClientIp } from "@/server/ip";
import { rateLimiter } from "@/server/bootstrap";
import { assessmentRepository, subscriptionRepository } from "@/db/repository";
import { getStandard } from "@/lib/standards/catalog";
import { resolveCrawlScope } from "@/lib/assessment/scope";
import { getOwnerId, getSessionUser, getUserId } from "@/server/auth";
import { isWholeSiteAllowed } from "@/lib/entitlement";
import { withCorrelationId } from "@/lib/observability/logger";
import { ANON_COOKIE } from "@/lib/auth/session";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limited = await rateLimiter.check(ip, IP_RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.allowed) {
    return NextResponse.json({ code: "RATE_LIMITED" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = assessRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: parsed.error.message },
      { status: 400 },
    );
  }

  const { url, standard, depth, pageCap, scope } = parsed.data;

  if (scope === "site") {
    const userId = await getUserId();
    const subscribed = userId ? await subscriptionRepository.isActive(userId) : false;
    const gate = isWholeSiteAllowed({ userId, subscribed });
    if (!gate.ok) {
      const status = gate.code === "UNAUTHORIZED" ? 401 : 402;
      return NextResponse.json({ code: gate.code }, { status });
    }
  }

  if (!getStandard(standard)) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: `Unknown standard: ${standard}` },
      { status: 400 },
    );
  }

  const ssrf = await validateTargetUrl(url);
  if (!ssrf.ok) {
    const code = ssrf.code === "SSRF_BLOCKED" ? "SSRF_BLOCKED" : "VALIDATION_ERROR";
    return NextResponse.json({ code }, { status: 400 });
  }

  const maxQueueDepth = Number(process.env.MAX_QUEUE_DEPTH ?? 500);
  const queued = await assessmentRepository.countQueued();
  if (queued >= maxQueueDepth) {
    return NextResponse.json(
      { code: "QUEUE_FULL", message: "The assessment queue is full. Please retry shortly." },
      { status: 503, headers: { "Retry-After": "60" } },
    );
  }

  const crawlScope = resolveCrawlScope(scope, depth, pageCap);

  // Owner: the signed-in user, or an anonymous session id (via cookie) so each
  // visitor's history is scoped to them (no leaking other users' assessments).
  const sessionUser = await getSessionUser();
  let ownerId = sessionUser?.id ?? null;
  let newAnonId: string | null = null;
  if (!ownerId) {
    const store = await cookies();
    ownerId = store.get(ANON_COOKIE)?.value ?? null;
    if (!ownerId) {
      ownerId = `anon_${randomUUID()}`;
      newAnonId = ownerId;
    }
  }

  const assessment = await assessmentRepository.create({
    url: ssrf.url.href,
    standard,
    depth: crawlScope.depth,
    pageCap: crawlScope.pageCap,
    ownerId,
  });

  withCorrelationId(assessment.id).info({ ip }, "assessment queued");

  const response = NextResponse.json(
    { id: assessment.id, status: "queued", url: ssrf.url.href, standard },
    { status: 202 },
  );
  if (newAnonId) {
    response.cookies.set(ANON_COOKIE, newAnonId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export async function GET() {
  const ownerId = await getOwnerId();
  const assessments = await assessmentRepository.list(ownerId);
  return NextResponse.json({ assessments });
}
