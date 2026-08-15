import { computeConformance, computeScore, type ConformanceResult } from "@/lib/scoring";
import { type CrawlOptions, type CrawlResult } from "@/lib/crawler";
import { ScanFailedError, type ScanResult } from "@/lib/scanner";
import { captureEvidence, type CapturedEvidence } from "@/lib/evidence/screenshot";
import {
  axeViolationsToFindings,
  consolidateFindings,
  type ToolFinding,
} from "@/lib/comparison/consolidate";
import type { IbmScanOutput } from "@/lib/comparison/ibm";
import { computeLighthouseScore } from "@/lib/standards/lighthouse-audits";
import { scsForTags } from "@/lib/standards/wcag-sc";
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
  testedScs: Set<string>;
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

    if (crawlResult.urls.length === 0) {
      await log("error", "no pages could be crawled");
      await deps.repository.fail(assessmentId);
      return;
    }

    await log(
      "info",
      crawlResult.sitemapUsed
        ? `sitemap fetched: ${crawlResult.sitemapUrlCount} urls`
        : "no sitemap found — link crawl",
    );
    await log("info", `crawl complete: ${crawlResult.urls.length} pages`);

    const output = await scanAndConsolidate(
      crawlResult.urls,
      standard,
      deps,
      assessmentId,
    );
    await log("info", `scan complete: ${output.findings.length} consolidated findings`);

    const score = computeScore(output.findings);
    const conformance = computeConformance(
      output.findings,
      output.testedScs,
      standard.level ?? "AA",
    );
    await log("info", `score: ${score.score}/100 (${score.passBand})`);

    const comparison: ComparisonData = {
      lighthouse: output.lighthouse,
      ibm: output.ibm,
      conformance,
    };

    await deps.repository.insertFindings(assessmentId, output.findings);
    await deps.repository.insertComparison(assessmentId, comparison);
    await deps.repository.complete(assessmentId, {
      score: score.score,
      passBand: score.passBand,
      pagesScanned: crawlResult.pagesScanned,
      partial: crawlResult.partial,
    });
  } catch (error) {
    // Transient error: re-throw so the worker can retry (retry-exhaustion
    // failure is handled by the worker route, not here).
    throw error;
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
  const testedScs = new Set<string>();
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
      const scanner = await deps.createScanner();
      try {
        for (let pageUrl = queue.shift(); pageUrl !== undefined; pageUrl = queue.shift()) {
          try {
            const scan = await scanner.scan(pageUrl, standard.axeTags);
            logs.push({
              timestamp: new Date().toISOString(),
              level: "info",
              message: `scanned ${pageUrl}: ${scan.violations.length} violations`,
            });

            for (const violation of scan.violations) {
              for (const sc of scsForTags(violation.tags)) testedScs.add(sc);
            }
            for (const pass of scan.passes) {
              for (const sc of scsForTags(pass.tags)) testedScs.add(sc);
            }
            for (const incomplete of scan.incomplete) {
              for (const sc of scsForTags(incomplete.tags)) testedScs.add(sc);
            }

            const pageFindings = axeViolationsToFindings(pageUrl, scan.violations);
            await captureAndAttachEvidence(
              pageUrl,
              scan,
              pageFindings,
              scanner,
              deps.evidenceStore,
              assessmentId,
            );
            axeFindings.push(...pageFindings);

            const lighthouse = computeLighthouseScore(scan.violations.map((v) => v.id));
            lighthouseScores.push(lighthouse.score);
            for (const audit of lighthouse.failedAudits) {
              lighthouseFailed.set(audit.id, audit.weight);
            }

            try {
              const ibm = await scanner.scanIbm(pageUrl);
              await attachIbmEvidence(ibm.findings, deps.evidenceStore, assessmentId, pageUrl);
              ibmFindings.push(...ibm.findings);
              ibmCounts.violation += ibm.counts.violation;
              ibmCounts.potentialViolation += ibm.counts.potentialViolation;
              ibmCounts.recommendation += ibm.counts.recommendation;
              ibmCounts.pass += ibm.counts.pass;
              ibmCounts.manual += ibm.counts.manual;
            } catch {
              /* IBM unavailable — continue with axe only */
            }
          } catch (error) {
            if (!(error instanceof ScanFailedError)) throw error;
            logs.push({
              timestamp: new Date().toISOString(),
              level: "warn",
              message: `scan failed: ${pageUrl}`,
            });
          }
        }
      } finally {
        await scanner.close();
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
    testedScs,
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
