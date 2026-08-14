import { handleCallback } from "@vercel/queue";
import { z } from "zod";
import { runAssessment } from "@/lib/assessment";
import { crawl } from "@/lib/crawler";
import { getStandard } from "@/lib/standards/catalog";
import { MAX_ATTEMPTS } from "@/lib/queue";
import { logger } from "@/lib/observability/logger";
import { assessmentRepository } from "@/db/repository";
import { createPageScanner } from "@/server/scanner-factory";

const payloadSchema = z.object({ assessmentId: z.string().min(1) });

const handler = handleCallback(async (message: unknown) => {
  const parsed = payloadSchema.safeParse(message);
  if (!parsed.success) {
    logger.error({ message }, "invalid queue message payload");
    return;
  }
  const { assessmentId } = parsed.data;

  const assessment = await assessmentRepository.findById(assessmentId);
  if (!assessment) {
    logger.warn({ assessmentId }, "assessment not found for queued job");
    return;
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
    await assessmentRepository.incrementAttempts(assessmentId);
    const attempts = await assessmentRepository.getAttempts(assessmentId);
    if (attempts >= MAX_ATTEMPTS) {
      await assessmentRepository.fail(assessmentId);
      return;
    }
    throw error;
  } finally {
    await scanner.close();
  }
});

export async function POST(req: Request) {
  return handler(req);
}
