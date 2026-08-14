import { NextResponse } from "next/server";
import { z } from "zod";
import { runAssessment } from "@/lib/assessment";
import { crawl } from "@/lib/crawler";
import { getStandard } from "@/lib/standards/catalog";
import { MAX_ATTEMPTS } from "@/lib/queue";
import { logger } from "@/lib/observability/logger";
import { assessmentRepository } from "@/db/repository";
import { createPageScanner } from "@/server/scanner-factory";

const payloadSchema = z.object({ assessmentId: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }
  const { assessmentId } = parsed.data;

  const assessment = await assessmentRepository.findById(assessmentId);
  if (!assessment) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const scanner = await createPageScanner();
  try {
    await runAssessment(assessmentId, {
      repository: assessmentRepository,
      crawlSite: (seed, options) => crawl(seed, options),
      scan: scanner.scan,
      resolveStandard: getStandard,
    });
  } catch (error) {
    logger.error({ err: error, assessmentId }, "assessment job attempt failed");
    await assessmentRepository.incrementJobAttempts(assessmentId);
    const job = await assessmentRepository.getJob(assessmentId);
    if ((job?.attempts ?? 0) >= MAX_ATTEMPTS) {
      await assessmentRepository.fail(assessmentId);
      return NextResponse.json({ ok: true, status: "failed" });
    }
    return NextResponse.json({ code: "SCAN_FAILED" }, { status: 500 });
  } finally {
    await scanner.close();
  }

  return NextResponse.json({ ok: true });
}
