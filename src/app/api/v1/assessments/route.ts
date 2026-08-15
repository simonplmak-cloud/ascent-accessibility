import { NextResponse } from "next/server";
import { assessRequestSchema } from "@/server/validation";
import { validateTargetUrl } from "@/server/ssrf";
import { IP_RATE_LIMIT, RATE_WINDOW_MS } from "@/server/rate-limit";
import { getClientIp } from "@/server/ip";
import { rateLimiter } from "@/server/bootstrap";
import { assessmentRepository } from "@/db/repository";
import { getStandard } from "@/lib/standards/catalog";
import { resolveCrawlScope } from "@/lib/assessment/scope";
import { withCorrelationId } from "@/lib/observability/logger";

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

  const crawlScope = resolveCrawlScope(scope, depth, pageCap);
  const assessment = await assessmentRepository.create({
    url: ssrf.url.href,
    standard,
    depth: crawlScope.depth,
    pageCap: crawlScope.pageCap,
  });

  withCorrelationId(assessment.id).info({ ip }, "assessment queued");

  return NextResponse.json(
    { id: assessment.id, status: "queued", url: ssrf.url.href, standard },
    { status: 202 },
  );
}

export async function GET() {
  const assessments = await assessmentRepository.list();
  return NextResponse.json({ assessments });
}
