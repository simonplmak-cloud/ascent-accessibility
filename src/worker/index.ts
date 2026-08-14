import { runAssessment } from "@/lib/assessment";
import { crawl } from "@/lib/crawler";
import { getStandard } from "@/lib/standards/catalog";
import { assessmentRepository } from "@/db/repository";
import { createPageScanner, type PageScanner } from "@/server/scanner-factory";
import { logger } from "@/lib/observability/logger";

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 5000);
const BATCH_SIZE = Number(process.env.WORKER_BATCH_SIZE ?? 5);

async function processQueued() {
  const queued = await assessmentRepository.findQueued(BATCH_SIZE);
  for (const assessment of queued) {
    let scanner: PageScanner | undefined;
    try {
      scanner = await createPageScanner();
      await runAssessment(assessment.id, {
        repository: assessmentRepository,
        crawlSite: (seed, options) => crawl(seed, options),
        scan: scanner.scan,
        resolveStandard: getStandard,
      });
      logger.info({ assessmentId: assessment.id }, "assessment completed");
    } catch (error) {
      logger.error({ err: error, assessmentId: assessment.id }, "assessment failed");
    } finally {
      if (scanner) await scanner.close();
    }
  }
}

async function main() {
  logger.info({ interval: POLL_INTERVAL_MS }, "assessment worker started");
  for (;;) {
    try {
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
