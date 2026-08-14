import { getRecommendation } from "@/lib/recommendations";
import { computeScore, type Impact } from "@/lib/scoring";
import { type CrawlOptions, type CrawlResult } from "@/lib/crawler";
import { ScanFailedError, type ScanResult } from "@/lib/scanner";
import type { Standard } from "@/lib/standards/catalog";
import type { LogEntry, LogLevel } from "@/db/schema";

export interface AssessmentRecord {
  id: string;
  url: string;
  standard: string;
  status: string;
  depth: number;
  pageCap: number;
}

export interface FindingInput {
  ruleId: string;
  impact: Impact;
  description: string;
  pageUrl: string;
  elementCount: number;
  recommendation: string;
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
  insertFindings(id: string, findings: FindingInput[]): Promise<void>;
  appendLog(id: string, entries: LogEntry[]): Promise<void>;
}

export interface PageScanner {
  scan: (url: string, tags: string[]) => Promise<ScanResult>;
  close: () => Promise<void>;
}

export interface AssessmentDeps {
  repository: AssessmentRepositoryPort;
  crawlSite: (seed: URL, options: CrawlOptions) => Promise<CrawlResult>;
  createScanner: () => Promise<PageScanner>;
  resolveStandard: (id: string) => Standard | undefined;
  concurrency?: number;
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

    const findings = await scanPages(crawlResult.urls, standard.axeTags, deps, assessmentId);
    await log("info", `scan complete: ${findings.length} findings`);

    const score = computeScore(findings);
    await log("info", `score: ${score.score}/100 (${score.passBand})`);

    await deps.repository.insertFindings(assessmentId, findings);
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

async function scanPages(
  urls: string[],
  tags: string[],
  deps: AssessmentDeps,
  assessmentId: string,
): Promise<FindingInput[]> {
  const findings: FindingInput[] = [];
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
            const scan = await scanner.scan(pageUrl, tags);
            logs.push({
              timestamp: new Date().toISOString(),
              level: "info",
              message: `scanned ${pageUrl}: ${scan.violations.length} violations`,
            });
            for (const violation of scan.violations) {
              findings.push({
                ruleId: violation.id,
                impact: violation.impact,
                description: violation.description,
                pageUrl,
                elementCount: violation.nodeCount,
                recommendation: getRecommendation(violation.id, violation.impact),
              });
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
  return findings;
}
