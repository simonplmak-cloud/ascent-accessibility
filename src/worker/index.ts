import { runAssessment } from "@/lib/assessment";
import { crawl } from "@/lib/crawler";
import { getStandard } from "@/lib/standards/catalog";
import { assessmentRepository, evidenceRepository, metricsRepository } from "@/db/repository";
import { createPageScanner, warmBrowserPool } from "@/server/scanner-factory";
import { runSiteAudit } from "@/lib/comparison/site-audit";
import { createAudioModel, createVisionModel } from "@/lib/ai-review/factory";
import { DEFAULT_AUDIO_MODEL, DEFAULT_VISION_MODEL, getProvider } from "@/lib/ai-review/providers";
import { resolveOwnerAi } from "@/server/byok";
import { logger } from "@/lib/observability/logger";
import { createMetrics } from "@/lib/observability/metrics";
import { optimizeEvidenceImage } from "@/lib/evidence/optimize";
import { renderAndStoreReportPdf } from "@/lib/export/render-report-pdf";
import { runCleanup, computeStorageTotals } from "@/lib/retention/cleanup";
import type { NewEvidence } from "@/db/schema";

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 1000);
const BATCH_SIZE = Number(process.env.WORKER_BATCH_SIZE ?? 5);
const STALE_RUNNING_MINUTES = Number(process.env.WORKER_STALE_RUNNING_MINUTES ?? 10);
const SCAN_CONCURRENCY = Number(process.env.WORKER_SCAN_CONCURRENCY ?? 5);
const ASSESSMENT_CONCURRENCY = Number(process.env.WORKER_ASSESSMENT_CONCURRENCY ?? 2);
const CLEANUP_INTERVAL_MS = Number(process.env.WORKER_CLEANUP_INTERVAL_MS ?? 3_600_000);
const CLEANUP_DRY_RUN = process.env.WORKER_CLEANUP_DRY_RUN === "1";
const ASSESSMENT_RETENTION_DAYS = Number(process.env.ASSESSMENT_RETENTION_DAYS ?? 180);
const AUDIT_LOG_RETENTION_DAYS = Number(process.env.AUDIT_LOG_RETENTION_DAYS ?? 30);
const MAGIC_LINK_TOKEN_TTL_MINUTES = Number(process.env.MAGIC_LINK_TOKEN_TTL_MINUTES ?? 15);
const EVIDENCE_COMPACTION_ENABLED = process.env.EVIDENCE_COMPACTION_ENABLED !== "0";
const STORAGE_QUOTA_BYTES_PER_USER = Number(process.env.STORAGE_QUOTA_BYTES_PER_USER ?? 524_288_000);

const metrics = createMetrics();

async function recoverStaleRunning() {
  const cutoff = new Date(Date.now() - STALE_RUNNING_MINUTES * 60 * 1000).toISOString();
  await assessmentRepository.recoverStaleRunning(cutoff);
}

async function processQueued() {
  const claimed = await assessmentRepository.claimNext(BATCH_SIZE);
  if (claimed.length === 0) return;

  let cursor = 0;
  const run = async () => {
    for (let i = cursor++; i < claimed.length; i = cursor++) {
      const assessment = claimed[i];
      if (!assessment) continue;
      const startedAt = Date.now();
      let failed = false;
      try {
        await runAssessment(assessment.id, {
          repository: assessmentRepository,
          crawlSite: (seed, options) => crawl(seed, options),
          createScanner: () => createPageScanner(),
          resolveStandard: getStandard,
          evidenceStore: {
            put: async (input: NewEvidence) => {
              const optimized = await optimizeEvidenceImage(input.image, input.mime, input.kind);
              const evidence = await evidenceRepository.create({
                ...input,
                image: optimized.image,
                mime: optimized.mime,
              });
              return { id: evidence.id };
            },
          },
          siteAudit: (url) => runSiteAudit(url),
          resolveByokModel: async (ownerId) => {
            const owner = await resolveOwnerAi(ownerId);
            if (!owner) return null;
            const provider = getProvider(owner.providerId);
            const visionModelId =
              owner.visionModelId ?? provider?.visionModels[0]?.id ?? DEFAULT_VISION_MODEL;
            const audioModelId =
              owner.audioModelId ?? provider?.audioModels[0]?.id ?? DEFAULT_AUDIO_MODEL;
            const modelReq = {
              providerId: owner.providerId,
              apiKey: owner.apiKey,
              baseUrl: owner.baseUrl ?? undefined,
            };
            return {
              provider: owner.providerId,
              visionModelId,
              visionModel: createVisionModel({ ...modelReq, model: visionModelId }),
              audioModel: createAudioModel({ ...modelReq, model: audioModelId }),
            };
          },
          concurrency: SCAN_CONCURRENCY,
        });

        // Generate + store the PDF (best-effort, after the audit backfill inside
        // runAssessment). A failure here never fails the assessment.
        try {
          await renderAndStoreReportPdf(assessment.id);
        } catch (error) {
          logger.warn({ err: error, assessmentId: assessment.id }, "pdf render failed — export falls back to on-demand");
        }
        logger.info({ assessmentId: assessment.id }, "assessment completed");
      } catch (error) {
        failed = true;
        logger.error({ err: error, assessmentId: assessment.id }, "assessment failed");
      } finally {
        metrics.recordScan(Date.now() - startedAt, failed);
      }
    }
  };

  const workers = Math.min(ASSESSMENT_CONCURRENCY, claimed.length);
  await Promise.all(Array.from({ length: workers }, run));
}

async function runCleanupSweep(): Promise<void> {
  const result = await runCleanup({
    dryRun: CLEANUP_DRY_RUN,
    reportRetentionDays: ASSESSMENT_RETENTION_DAYS,
    auditLogRetentionDays: AUDIT_LOG_RETENTION_DAYS,
    magicLinkTokenTtlMinutes: MAGIC_LINK_TOKEN_TTL_MINUTES,
    compactionEnabled: EVIDENCE_COMPACTION_ENABLED,
  });

  const totals = await computeStorageTotals();
  const totalBytes = totals.evidence + totals.assessment + totals.reportPdf;
  await metricsRepository.upsert({
    storageBytes: totalBytes,
    queueDepth: await assessmentRepository.countQueued(),
    failedScans24h: await assessmentRepository.countFailed24h(),
  });

  if (CLEANUP_DRY_RUN) {
    logger.info({ result, storageBytes: totalBytes }, "cleanup sweep (dry-run)");
  } else {
    logger.info({ result, storageBytes: totalBytes }, "cleanup sweep complete");
  }

  if (totalBytes > 0.8 * STORAGE_QUOTA_BYTES_PER_USER) {
    logger.warn({ totalBytes, quota: STORAGE_QUOTA_BYTES_PER_USER }, "global storage above 80% of tier");
  }
}

async function main() {
  logger.info(
    { interval: POLL_INTERVAL_MS, concurrency: SCAN_CONCURRENCY, assessmentConcurrency: ASSESSMENT_CONCURRENCY },
    "assessment worker started",
  );
  void warmBrowserPool();

  let lastCleanup = 0;
  for (;;) {
    try {
      await recoverStaleRunning();
      await processQueued();
      const now = Date.now();
      if (now - lastCleanup >= CLEANUP_INTERVAL_MS) {
        lastCleanup = now;
        await runCleanupSweep();
      }
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
