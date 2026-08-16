import { runAssessment } from "@/lib/assessment";
import { crawl } from "@/lib/crawler";
import { getStandard } from "@/lib/standards/catalog";
import { assessmentRepository, evidenceRepository } from "@/db/repository";
import { createPageScanner } from "@/server/scanner-factory";
import { logger } from "@/lib/observability/logger";

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 5000);
const BATCH_SIZE = Number(process.env.WORKER_BATCH_SIZE ?? 5);
const STALE_RUNNING_MINUTES = Number(process.env.WORKER_STALE_RUNNING_MINUTES ?? 10);
const SCAN_CONCURRENCY = Number(process.env.WORKER_SCAN_CONCURRENCY ?? 5);
const ASSESSMENT_CONCURRENCY = Number(process.env.WORKER_ASSESSMENT_CONCURRENCY ?? 2);

async function recoverStaleRunning() {
  const cutoff = new Date(Date.now() - STALE_RUNNING_MINUTES * 60 * 1000).toISOString();
  await assessmentRepository.recoverStaleRunning(cutoff);
}

async function processQueued() {
  const claimed = await assessmentRepository.claimNext(BATCH_SIZE);
  if (claimed.length === 0) return;

  // Process assessments with bounded concurrency (each assessment internally
  // scans pages with SCAN_CONCURRENCY, so the total browser count is
  // ASSESSMENT_CONCURRENCY × SCAN_CONCURRENCY).
  let cursor = 0;
  const run = async () => {
    for (let i = cursor++; i < claimed.length; i = cursor++) {
      const assessment = claimed[i];
      if (!assessment) continue;
      try {
        await runAssessment(assessment.id, {
          repository: assessmentRepository,
          crawlSite: (seed, options) => crawl(seed, options),
          createScanner: () => createPageScanner(),
          resolveStandard: getStandard,
          evidenceStore: {
            put: async (input) => {
              const evidence = await evidenceRepository.create(input);
              return { id: evidence.id };
            },
          },
          concurrency: SCAN_CONCURRENCY,
        });
        logger.info({ assessmentId: assessment.id }, "assessment completed");
      } catch (error) {
        logger.error({ err: error, assessmentId: assessment.id }, "assessment failed");
      }
    }
  };

  const workers = Math.min(ASSESSMENT_CONCURRENCY, claimed.length);
  await Promise.all(Array.from({ length: workers }, run));
}

async function main() {
  logger.info(
    { interval: POLL_INTERVAL_MS, concurrency: SCAN_CONCURRENCY, assessmentConcurrency: ASSESSMENT_CONCURRENCY },
    "assessment worker started",
  );
  for (;;) {
    try {
      await recoverStaleRunning();
      await processQueued();
    } catch (error) {
      logger.error({ err: error }, "worker poll iteration failed");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

main().catch((error) => {
  logger.error({ err: error }, "worker crashed");
  process.exit(1);
});
