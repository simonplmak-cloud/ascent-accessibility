import { computeScore, type ConformanceResult } from "@/lib/scoring";
import { type CrawlOptions, type CrawlResult } from "@/lib/crawler";
import { ScanFailedError, type ScanResult, type ScanViolation } from "@/lib/scanner";
import type { CapturedEvidence } from "@/lib/evidence/screenshot";
import {
  violationsToFindings,
  consolidateFindings,
  type ToolFinding,
} from "@/lib/comparison/consolidate";
import type { SiteAuditReport } from "@/lib/comparison/site-audit";
import { scsForTags } from "@/lib/standards/wcag-sc";
import {
  EMPTY_FEATURES,
  mergeFeatures,
  type PageFeatures,
} from "@/lib/standards/sc-applicability";
import type { Standard } from "@/lib/standards/catalog";
import type { AiBudget, AiReview, VisionModel } from "@/lib/ai-review/types";
import { evaluateStandard } from "@/lib/assessment/evaluate";
import type { Finding, LogEntry, LogLevel, NewEvidence } from "@/db/schema";

export interface AssessmentRecord {
  id: string;
  url: string;
  standard: string;
  status: string;
  depth: number;
  pageCap: number;
}

export interface ComparisonData {
  audit?: SiteAuditReport;
  conformance: ConformanceResult;
  ai?: { model: string; verdicts: AiReview[]; budget: AiBudget };
}

export interface AssessmentRepositoryPort {
  findById(id: string): Promise<AssessmentRecord | undefined>;
  setStatus(id: string, status: string): Promise<void>;
  complete(
    id: string,
    input: {
      score: number;
      passBand: "pass" | "partial" | "fail";
      pagesScanned: number;
      partial: boolean;
    },
  ): Promise<void>;
  finalize(
    id: string,
    input: {
      score: number;
      passBand: "pass" | "partial" | "fail";
      pagesScanned: number;
      partial: boolean;
      findings: Finding[];
      comparison: unknown;
    },
  ): Promise<void>;
  fail(id: string): Promise<void>;
  insertFindings(id: string, findings: Finding[]): Promise<void>;
  insertComparison(id: string, comparison: ComparisonData): Promise<void>;
  appendLog(id: string, entries: LogEntry[]): Promise<void>;
  setLog(id: string, entries: LogEntry[]): Promise<void>;
}

export interface EvidenceStorePort {
  put(input: NewEvidence): Promise<{ id: string }>;
}

export interface PageScanner {
  scan: (url: string, tags: string[]) => Promise<ScanResult>;
  captureEvidence: (result: ScanResult) => Promise<CapturedEvidence>;
  screenshotPage: () => Promise<Buffer>;
  interactionScan: () => Promise<ScanViolation[]>;
  close: () => Promise<void>;
  discard: () => Promise<void>;
}

export interface AssessmentDeps {
  repository: AssessmentRepositoryPort;
  crawlSite: (seed: URL, options: CrawlOptions) => Promise<CrawlResult>;
  createScanner: () => Promise<PageScanner>;
  resolveStandard: (id: string) => Standard | undefined;
  evidenceStore: EvidenceStorePort;
  siteAudit?: (url: string) => Promise<SiteAuditReport>;
  visionModel?: VisionModel;
  concurrency?: number;
}

interface ConsolidateOutput {
  findings: Finding[];
  passedScs: Set<string>;
  features: PageFeatures;
  aiScreenshot: Buffer | null;
  incompleteContext: string[];
}

export async function runAssessment(
  assessmentId: string,
  deps: AssessmentDeps,
): Promise<void> {
  const assessment = await deps.repository.findById(assessmentId);
  if (!assessment) {
    throw new Error(`Assessment ${assessmentId} not found`);
  }
  if (assessment.status === "completed" || assessment.status === "failed") {
    return;
  }

  const standard = deps.resolveStandard(assessment.standard);
  if (!standard) {
    await deps.repository.fail(assessmentId);
    return;
  }

  await deps.repository.setStatus(assessmentId, "running");

  // Buffered live log: entries accumulate in memory and are flushed (a full
  // overwrite, no read) every 300ms — avoids a read+write round-trip per entry.
  const logEntries: LogEntry[] = [];
  let flushing = false;
  const flushLogs = async (): Promise<void> => {
    if (flushing || logEntries.length === 0) return;
    flushing = true;
    try {
      await deps.repository.setLog(assessmentId, [...logEntries]);
    } finally {
      flushing = false;
    }
  };
  const flushTimer = setInterval(() => void flushLogs(), 300);
  const log = (level: LogLevel, message: string): Promise<void> => {
    logEntries.push({ timestamp: new Date().toISOString(), level, message });
    return Promise.resolve();
  };

  try {
    const seed = new URL(assessment.url);
    await log("info", `assessment started for ${assessment.url}`);

    // Single-page scans (depth 0) skip the crawl entirely — there is nothing to
    // discover, and the robots/sitemap/page fetches are pure overhead.
    let urls: string[];
    let pagesScanned: number;
    let partial: boolean;
    if (assessment.depth === 0) {
      urls = [seed.href];
      pagesScanned = 1;
      partial = false;
      await log("info", "single-page scan — scanning the URL directly");
    } else {
      const crawlResult = await deps.crawlSite(seed, {
        maxDepth: assessment.depth,
        maxPages: assessment.pageCap,
      });
      for (const message of crawlResult.log ?? []) {
        await log("info", message);
      }
      if (crawlResult.urls.length === 0) {
        await log("error", "no pages could be crawled");
        await deps.repository.fail(assessmentId);
        return;
      }
      await log("info", `crawl complete: ${crawlResult.urls.length} page(s) to scan`);
      urls = crawlResult.urls;
      pagesScanned = crawlResult.pagesScanned;
      partial = crawlResult.partial;
    }

    const output = await scanAndConsolidate(urls, standard, deps, assessmentId, log);

    await log(
      "info",
      `scan complete: ${output.findings.length} finding(s) across ${urls.length} page(s)`,
    );

    const evaluated = await evaluateStandard(
      {
        version: standard.version,
        level: standard.level ?? "AA",
        findings: output.findings,
        passedScs: output.passedScs,
        features: output.features,
        pageUrl: seed.href,
      },
      {
        visionModel: deps.visionModel,
        aiScreenshot: output.aiScreenshot,
        incompleteContext: output.incompleteContext,
        aiEnabled: ENABLE_AI_REVIEW,
        threshold: Number(process.env.AI_REVIEW_CONFIDENCE_THRESHOLD ?? 0.8),
      },
    );

    const findings = evaluated.findings;
    const conformance = evaluated.conformance;
    const aiVerdicts = evaluated.aiVerdicts;
    const aiBudget = evaluated.aiBudget;
    const score = computeScore(findings);

    await log(
      "info",
      `WCAG conformance: ${conformance.passed} Passed / ${conformance.failed} Failed / ${conformance.notPresent} Not present / ${conformance.cannotTell} Cannot tell (${conformance.coverage}% tested)`,
    );
    await log("info", `score: ${score.score}/100 (${score.passBand})`);

    const comparison: ComparisonData = {
      conformance,
      ai:
        ENABLE_AI_REVIEW && deps.visionModel
          ? { model: AI_REVIEW_MODEL, verdicts: aiVerdicts, budget: aiBudget }
          : undefined,
    };

    await log("info", `storing findings and evidence (${findings.length} findings)`);
    await deps.repository.finalize(assessmentId, {
      score: score.score,
      passBand: score.passBand,
      pagesScanned,
      partial,
      findings,
      comparison,
    });
    await log("info", "assessment complete");
    await flushLogs();

    // Backfill the site audit (Lighthouse) after the accessibility result is
    // already finalized and readable — the perf/SEO appendix fills in later.
    if (deps.siteAudit) {
      try {
        const audit = await runSiteAudit(urls, deps);
        if (audit) {
          await deps.repository.insertComparison(assessmentId, { ...comparison, audit });
        }
      } catch {
        /* audit backfill failed — the accessibility result stands */
      }
    }
  } catch (error) {
    // Transient error: re-throw so the worker can retry (retry-exhaustion
    // failure is handled by the worker route, not here).
    throw error;
  } finally {
    clearInterval(flushTimer);
    await flushLogs();
  }
}

// Per-page scan timeout. A pathological page can hang a worker forever and
// block the whole queue. On timeout we close and recreate the browser so the
// hung operation is actually torn down.
const PAGE_TIMEOUT_MS = Number(process.env.WORKER_PAGE_TIMEOUT_MS ?? 180_000);

// Qwen-VL needs-review triage (off by default — adds a vision call per assessment).
const ENABLE_AI_REVIEW = process.env.ENABLE_AI_REVIEW === "true";
const AI_REVIEW_MODEL = process.env.AI_REVIEW_MODEL ?? "qwen3-vl-flash";

class PageTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} timed out after ${ms}ms`);
    this.name = "PageTimeoutError";
  }
}

async function withTimeout<T>(
  operation: () => Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new PageTimeoutError(label, ms)), ms);
  });
  try {
    return await Promise.race([operation(), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function scanAndConsolidate(
  urls: string[],
  standard: Standard,
  deps: AssessmentDeps,
  assessmentId: string,
  log: (level: LogLevel, message: string) => void,
): Promise<ConsolidateOutput> {
  const engineFindings: ToolFinding[] = [];
  const passedScs = new Set<string>();
  let features: PageFeatures = EMPTY_FEATURES;
  let aiScreenshot: Buffer | null = null;
  const incompleteContext: string[] = [];
  const concurrency = Math.max(1, deps.concurrency ?? 4);
  const queue = [...urls];

  const workers = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      let scanner = await deps.createScanner();
      try {
        for (let pageUrl = queue.shift(); pageUrl !== undefined; pageUrl = queue.shift()) {
          const url = pageUrl;
          try {
            await withTimeout(
              async () => {
                log("info", `scanning ${url} with the Ascent Access engine`);

                const scan = await scanner.scan(url, standard.tags);
                log("info", `engine: ${scan.violations.length} violation(s) on ${url}`);

                for (const pass of scan.passes) {
                  for (const sc of scsForTags(pass.tags)) passedScs.add(sc);
                }
                features = mergeFeatures(features, scan.features);

                const pageFindings = violationsToFindings(url, scan.violations);
                await captureAndAttachEvidence(
                  url,
                  scan,
                  pageFindings,
                  scanner,
                  deps.evidenceStore,
                  assessmentId,
                );
                if (scan.violations.length > 0) {
                  log("info", `captured screenshot evidence for ${url}`);
                }
                engineFindings.push(...pageFindings);

                for (const inc of scan.incomplete) {
                  for (const node of inc.nodes ?? []) {
                    if (node.failureSummary) {
                      incompleteContext.push(`${inc.id}: ${node.failureSummary}`);
                    }
                  }
                }

                try {
                  const interaction = await scanner.interactionScan();
                  if (interaction.length > 0) {
                    engineFindings.push(...violationsToFindings(url, interaction));
                  }
                } catch {
                  /* interaction checks unavailable — continue with the engine alone */
                }

                if (!aiScreenshot) {
                  try {
                    aiScreenshot = await scanner.screenshotPage();
                  } catch {
                    /* AI screenshot optional — triage degrades to needs-review */
                  }
                }
              },
              PAGE_TIMEOUT_MS,
              `scan of ${url}`,
            );
          } catch (error) {
            // A single bad page (browser crash, scan timeout, or load failure)
            // must not fail the whole assessment — restart the browser and
            // continue with the next page.
            const reason =
              error instanceof PageTimeoutError
                ? "timed out"
                : error instanceof ScanFailedError
                  ? "failed to load"
                  : `errored (${error instanceof Error ? error.message : String(error)})`;
            log("warn", `page scan ${reason} — restarting browser: ${url}`);
            try {
              await scanner.discard();
            } catch {
              /* ignore */
            }
            scanner = await deps.createScanner();
          }
        }
      } finally {
        try {
          await scanner.close();
        } catch {
          /* ignore */
        }
      }
    },
  );

  await Promise.all(workers);

  const findings = consolidateFindings(engineFindings);

  return {
    findings,
    passedScs,
    features,
    aiScreenshot,
    incompleteContext,
  };
}

// Runs the site audit (Lighthouse) over the scanned pages concurrently and
// aggregates the signals into a single SiteAuditReport. Called as a backfill
// after the accessibility result has already been finalized, so the report is
// readable immediately and the audit appendix fills in shortly after.
async function runSiteAudit(
  urls: string[],
  deps: AssessmentDeps,
): Promise<SiteAuditReport | undefined> {
  if (!deps.siteAudit) return undefined;

  const signalSums = new Map<string, number>();
  const failedAudits = new Map<string, number>();
  let auditRuns = 0;
  let auditVersion: string | undefined;
  const concurrency = Math.max(1, deps.concurrency ?? 4);
  const queue = [...urls];

  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
      try {
        const audit = await deps.siteAudit!(url);
        if (audit.signals) {
          for (const [key, value] of Object.entries(audit.signals)) {
            if (typeof value === "number") {
              signalSums.set(key, (signalSums.get(key) ?? 0) + value);
            }
          }
          auditRuns += 1;
        }
        for (const failed of audit.failedAudits) {
          failedAudits.set(failed.id, failed.weight);
        }
        if (audit.auditVersion) auditVersion = audit.auditVersion;
      } catch {
        /* audit failed for this page — skip */
      }
    }
  });

  await Promise.all(workers);

  if (auditRuns === 0) return undefined;

  const avg = (key: string): number | undefined => {
    const sum = signalSums.get(key);
    return sum === undefined ? undefined : Math.round(sum / auditRuns);
  };

  return {
    score: avg("accessibility") ?? 100,
    failedAudits: [...failedAudits.entries()].map(([id, weight]) => ({ id, weight })),
    signals: {
      accessibility: avg("accessibility"),
      performance: avg("performance"),
      seo: avg("seo"),
      bestPractices: avg("bestPractices"),
      pwa: avg("pwa"),
    },
    auditVersion,
  };
}

async function captureAndAttachEvidence(
  pageUrl: string,
  scan: ScanResult,
  pageFindings: ToolFinding[],
  scanner: PageScanner,
  evidenceStore: EvidenceStorePort,
  assessmentId: string,
): Promise<void> {
  if (scan.violations.length === 0) return;

  let captured: CapturedEvidence;
  try {
    captured = await scanner.captureEvidence(scan);
  } catch {
    return;
  }

  let fullPageId: string | null = null;
  try {
    const ev = await evidenceStore.put({
      assessmentId,
      pageUrl,
      kind: "page",
      image: captured.fullPage.toString("base64"),
      mime: captured.fullPageMime,
    });
    fullPageId = ev.id;
  } catch {
    /* evidence store unavailable — continue without page screenshot */
  }

  const elementIds = new Map<string, string>();
  for (const el of captured.elements) {
    try {
      const ev = await evidenceStore.put({
        assessmentId,
        pageUrl,
        kind: "element",
        image: el.buffer.toString("base64"),
        mime: el.mime,
      });
      elementIds.set(`${el.ruleId}:${el.instanceIndex}`, ev.id);
    } catch {
      /* skip individual evidence on failure */
    }
  }

  for (const finding of pageFindings) {
    for (let i = 0; i < finding.nodes.length; i++) {
      const id = elementIds.get(`${finding.ruleId}:${i}`) ?? fullPageId;
      if (id) finding.nodes[i]!.evidenceId = id;
    }
  }
}
