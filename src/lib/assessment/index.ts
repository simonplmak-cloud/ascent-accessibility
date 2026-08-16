import { computeConformance, computeScore, type ConformanceResult } from "@/lib/scoring";
import { type CrawlOptions, type CrawlResult } from "@/lib/crawler";
import { ScanFailedError, type ScanResult } from "@/lib/scanner";
import type { CapturedEvidence } from "@/lib/evidence/screenshot";
import {
  axeViolationsToFindings,
  consolidateFindings,
  type ToolFinding,
} from "@/lib/comparison/consolidate";
import type { IbmScanOutput } from "@/lib/comparison/ibm";
import { computeLighthouseScore } from "@/lib/standards/lighthouse-audits";
import { scsForTags } from "@/lib/standards/wcag-sc";
import {
  EMPTY_FEATURES,
  mergeFeatures,
  type PageFeatures,
} from "@/lib/standards/sc-applicability";
import type { Standard } from "@/lib/standards/catalog";
import type { Finding, LogEntry, LogLevel, NewEvidence } from "@/db/schema";

export interface AssessmentRecord {
  id: string;
  url: string;
  standard: string;
  status: string;
  depth: number;
  pageCap: number;
}

export interface IbmCounts {
  violation: number;
  potentialViolation: number;
  recommendation: number;
  pass: number;
  manual: number;
}

export interface ComparisonData {
  lighthouse: { score: number; failedAudits: Array<{ id: string; weight: number }> };
  ibm: IbmCounts;
  conformance: ConformanceResult;
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
  fail(id: string): Promise<void>;
  insertFindings(id: string, findings: Finding[]): Promise<void>;
  insertComparison(id: string, comparison: ComparisonData): Promise<void>;
  appendLog(id: string, entries: LogEntry[]): Promise<void>;
}

export interface EvidenceStorePort {
  put(input: NewEvidence): Promise<{ id: string }>;
}

export interface PageScanner {
  scan: (url: string, tags: string[]) => Promise<ScanResult>;
  captureEvidence: (result: ScanResult) => Promise<CapturedEvidence>;
  scanIbm: (url: string) => Promise<IbmScanOutput>;
  close: () => Promise<void>;
}

export interface AssessmentDeps {
  repository: AssessmentRepositoryPort;
  crawlSite: (seed: URL, options: CrawlOptions) => Promise<CrawlResult>;
  createScanner: () => Promise<PageScanner>;
  resolveStandard: (id: string) => Standard | undefined;
  evidenceStore: EvidenceStorePort;
  concurrency?: number;
}

interface ConsolidateOutput {
  findings: Finding[];
  lighthouse: ComparisonData["lighthouse"];
  ibm: IbmCounts;
  passedScs: Set<string>;
  features: PageFeatures;
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

  const log = (level: LogLevel, message: string): Promise<void> =>
    deps.repository.appendLog(assessmentId, [
      { timestamp: new Date().toISOString(), level, message },
    ]);

  try {
    const seed = new URL(assessment.url);
    await log("info", `assessment started for ${assessment.url}`);
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

    const output = await scanAndConsolidate(
      crawlResult.urls,
      standard,
      deps,
      assessmentId,
    );

    await log("info", "consolidating findings from axe-core, Lighthouse, and IBM Equal Access");
    await log(
      "info",
      `scan complete: ${output.findings.length} consolidated finding(s) across ${crawlResult.urls.length} page(s)`,
    );

    const score = computeScore(output.findings);
    const conformance = computeConformance(
      output.findings,
      output.passedScs,
      output.features,
      standard.level ?? "AA",
    );
    await log(
      "info",
      `WCAG conformance: ${conformance.passed} pass / ${conformance.failed} fail / ${conformance.notApplicable} not applicable / ${conformance.needsReview} needs review (${conformance.coverage}% machine-tested)`,
    );
    await log("info", `score: ${score.score}/100 (${score.passBand})`);

    const comparison: ComparisonData = {
      lighthouse: output.lighthouse,
      ibm: output.ibm,
      conformance,
    };

    await log("info", `storing findings and evidence (${output.findings.length} findings)`);
    await deps.repository.insertFindings(assessmentId, output.findings);
    await deps.repository.insertComparison(assessmentId, comparison);
    await deps.repository.complete(assessmentId, {
      score: score.score,
      passBand: score.passBand,
      pagesScanned: crawlResult.pagesScanned,
      partial: crawlResult.partial,
    });
    await log("info", "assessment complete");
  } catch (error) {
    // Transient error: re-throw so the worker can retry (retry-exhaustion
    // failure is handled by the worker route, not here).
    throw error;
  }
}

// Per-page scan timeout. `page.goto` already has a 45s timeout, but
// `page.evaluate` (axe-core run) and `scanIbm` have none — a pathological page
// can hang a worker forever and block the whole queue. On timeout we close and
// recreate the browser so the hung operation is actually torn down.
const PAGE_TIMEOUT_MS = Number(process.env.WORKER_PAGE_TIMEOUT_MS ?? 180_000);

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
): Promise<ConsolidateOutput> {
  const axeFindings: ToolFinding[] = [];
  const ibmFindings: ToolFinding[] = [];
  const ibmCounts = { violation: 0, potentialViolation: 0, recommendation: 0, pass: 0, manual: 0 };
  const passedScs = new Set<string>();
  let features: PageFeatures = EMPTY_FEATURES;
  const lighthouseScores: number[] = [];
  const lighthouseFailed = new Map<string, number>();
  const logs: LogEntry[] = [];
  const concurrency = Math.max(1, deps.concurrency ?? 4);
  const queue = [...urls];

  let flushChain: Promise<void> = Promise.resolve();
  function flushLogs(): Promise<void> {
    flushChain = flushChain.then(async () => {
      if (logs.length === 0) return;
      const batch = logs.splice(0);
      await deps.repository.appendLog(assessmentId, batch);
    });
    return flushChain;
  }
  const flushTimer = setInterval(() => void flushLogs(), 3000);

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
                logs.push({
                  timestamp: new Date().toISOString(),
                  level: "info",
                  message: `scanning ${url} with axe-core`,
                });
                const scan = await scanner.scan(url, standard.axeTags);
                logs.push({
                  timestamp: new Date().toISOString(),
                  level: "info",
                  message: `axe-core: ${scan.violations.length} violation(s) on ${url}`,
                });

                for (const pass of scan.passes) {
                  for (const sc of scsForTags(pass.tags)) passedScs.add(sc);
                }
                features = mergeFeatures(features, scan.features);

                const pageFindings = axeViolationsToFindings(url, scan.violations);
                await captureAndAttachEvidence(
                  url,
                  scan,
                  pageFindings,
                  scanner,
                  deps.evidenceStore,
                  assessmentId,
                );
                if (scan.violations.length > 0) {
                  logs.push({
                    timestamp: new Date().toISOString(),
                    level: "info",
                    message: `captured screenshot evidence for ${url}`,
                  });
                }
                axeFindings.push(...pageFindings);

                const lighthouse = computeLighthouseScore(scan.violations.map((v) => v.id));
                lighthouseScores.push(lighthouse.score);
                for (const audit of lighthouse.failedAudits) {
                  lighthouseFailed.set(audit.id, audit.weight);
                }

                try {
                  logs.push({
                    timestamp: new Date().toISOString(),
                    level: "info",
                    message: `running IBM Equal Access on ${url}`,
                  });
                  const ibm = await scanner.scanIbm(url);
                  await attachIbmEvidence(ibm.findings, deps.evidenceStore, assessmentId, url);
                  ibmFindings.push(...ibm.findings);
                  ibmCounts.violation += ibm.counts.violation;
                  ibmCounts.potentialViolation += ibm.counts.potentialViolation;
                  ibmCounts.recommendation += ibm.counts.recommendation;
                  ibmCounts.pass += ibm.counts.pass;
                  ibmCounts.manual += ibm.counts.manual;
                  logs.push({
                    timestamp: new Date().toISOString(),
                    level: "info",
                    message: `IBM Equal Access: ${ibm.counts.violation} violation(s), ${ibm.counts.pass} pass(es) on ${url}`,
                  });
                } catch {
                  /* IBM unavailable — continue with axe only */
                }
              },
              PAGE_TIMEOUT_MS,
              `scan of ${url}`,
            );
          } catch (error) {
            // A single bad page (browser crash, scan timeout, or load failure)
            // must not fail the whole assessment — restart the browser and
            // continue with the next page. This is what previously left
            // assessments "running" forever (a crash re-threw, and the stale
            // record was re-queued in an endless retry loop).
            const reason =
              error instanceof PageTimeoutError
                ? "timed out"
                : error instanceof ScanFailedError
                  ? "failed to load"
                  : `errored (${error instanceof Error ? error.message : String(error)})`;
            logs.push({
              timestamp: new Date().toISOString(),
              level: "warn",
              message: `page scan ${reason} — restarting browser: ${url}`,
            });
            try {
              await scanner.close();
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
  clearInterval(flushTimer);
  await flushLogs();

  const findings = consolidateFindings(axeFindings, ibmFindings);
  const lighthouseScore =
    lighthouseScores.length === 0
      ? 100
      : Math.round(lighthouseScores.reduce((a, b) => a + b, 0) / lighthouseScores.length);

  return {
    findings,
    lighthouse: { score: lighthouseScore, failedAudits: [...lighthouseFailed.entries()].map(([id, weight]) => ({ id, weight })) },
    ibm: ibmCounts,
    passedScs,
    features,
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

async function attachIbmEvidence(
  findings: ToolFinding[],
  evidenceStore: EvidenceStorePort,
  assessmentId: string,
  pageUrl: string,
): Promise<void> {
  for (const finding of findings) {
    for (const node of finding.nodes) {
      if (!node.screenshot) continue;
      try {
        const ev = await evidenceStore.put({
          assessmentId,
          pageUrl,
          kind: "element",
          image: node.screenshot.toString("base64"),
          mime: "image/png",
        });
        node.evidenceId = ev.id;
      } catch {
        /* skip on failure */
      }
      node.screenshot = undefined;
    }
  }
}
