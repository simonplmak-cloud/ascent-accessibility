import { NextResponse } from "next/server";
import { assessRequestSchema } from "@/server/validation";
import { validateTargetUrl } from "@/server/ssrf";
import { IP_RATE_LIMIT, RATE_WINDOW_MS } from "@/server/rate-limit";
import { getClientIp } from "@/server/ip";
import { apiKeyService, rateLimiter } from "@/server/bootstrap";
import { assessmentRepository } from "@/db/repository";
import { getStandard } from "@/lib/standards/catalog";
import { resolveCrawlScope } from "@/lib/assessment/scope";
import { getSessionUser } from "@/server/auth";
import { withCorrelationId } from "@/lib/observability/logger";

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // API-key authentication (programmatic access — verified users only; keys are
  // issued to verified accounts, so a valid key implies a verified owner).
  const authHeader = req.headers.get("authorization");
  const rawKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  let apiKeyUserId: string | null = null;
  let sessionUserId: string | null = null;
  if (rawKey) {
    const auth = await apiKeyService.authenticate(rawKey);
    if (!auth.ok) {
      return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
    }
    // Per-key rate limit (requests/min) — IP limiter does not apply to API keys.
    const keyLimited = await rateLimiter.check(auth.apiKeyId, auth.rateLimit, 60_000);
    if (!keyLimited.allowed) {
      return NextResponse.json({ code: "RATE_LIMITED" }, { status: 429 });
    }
    apiKeyUserId = auth.userId;
  } else {
    // Session auth: every scan requires a signed-in account (identity-gated).
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
    }
    const limited = await rateLimiter.check(ip, IP_RATE_LIMIT, RATE_WINDOW_MS);
    if (!limited.allowed) {
      return NextResponse.json({ code: "RATE_LIMITED" }, { status: 429 });
    }
    sessionUserId = sessionUser.id;
  }

  const body = await req.json().catch(() => null);
  const parsed = assessRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: parsed.error.message },
      { status: 400 },
    );
  }

  const { url, standard, depth, pageCap, scope, locale } = parsed.data;

  // Per-account daily scan limits (bound the slow whole-site path).
  if (sessionUserId) {
    const day = new Date().toISOString().slice(0, 10);
    const dailyLimit =
      scope === "site"
        ? Number(process.env.SCAN_SITE_DAILY_LIMIT ?? 3)
        : Number(process.env.SCAN_PAGE_DAILY_LIMIT ?? 20);
    const accountLimited = await rateLimiter.check(
      `account:${sessionUserId}:${scope}:${day}`,
      dailyLimit,
      24 * 60 * 60 * 1000,
    );
    if (!accountLimited.allowed) {
      return NextResponse.json({ code: "RATE_LIMITED" }, { status: 429 });
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

  // Owner: API-key account id > signed-in account id. No anonymous path.
  const ownerId = apiKeyUserId ?? sessionUserId;

  const assessment = await assessmentRepository.create({
    url: ssrf.url.href,
    standard,
    depth: crawlScope.depth,
    pageCap: crawlScope.pageCap,
    ownerId,
    locale,
  });

  withCorrelationId(assessment.id).info({ ip }, "assessment queued");

  return NextResponse.json(
    { id: assessment.id, status: "queued", url: ssrf.url.href, standard },
    { status: 202 },
  );
}

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ assessments: [] });
  }
  const assessments = await assessmentRepository.list(sessionUser.id);
  return NextResponse.json({ assessments });
}
