import { getRecommendation } from "@/lib/recommendations";
import { computeScore, type Impact } from "@/lib/scoring";
import { type CrawlOptions } from "@/lib/crawler";
import { ScanFailedError, type ScanResult } from "@/lib/scanner";
import type { Standard } from "@/lib/standards/catalog";

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
}

export interface PageScanner {
  scan: (url: string, tags: string[]) => Promise<ScanResult>;
  close: () => Promise<void>;
}

export interface AssessmentDeps {
  repository: AssessmentRepositoryPort;
  crawlSite: (
    seed: URL,
    options: CrawlOptions,
  ) => Promise<{ urls: string[]; pagesScanned: number; partial: boolean }>;
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

  try {
    const seed = new URL(assessment.url);
    const crawlResult = await deps.crawlSite(seed, {
      maxDepth: assessment.depth,
      maxPages: assessment.pageCap,
    });

    if (crawlResult.urls.length === 0) {
      await deps.repository.fail(assessmentId);
      return;
    }

    const findings = await scanPages(crawlResult.urls, standard.axeTags, deps);

    const score = computeScore(findings);
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
): Promise<FindingInput[]> {
  const findings: FindingInput[] = [];
  const concurrency = Math.max(1, deps.concurrency ?? 4);
  const queue = [...urls];

  const workers = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      const scanner = await deps.createScanner();
      try {
        for (let pageUrl = queue.shift(); pageUrl !== undefined; pageUrl = queue.shift()) {
          try {
            const scan = await scanner.scan(pageUrl, tags);
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
          }
        }
      } finally {
        await scanner.close();
      }
    },
  );

  await Promise.all(workers);
  return findings;
}
