import { assessmentRepository, evidenceRepository } from "@/db/repository";
import type { Assessment, ScannedPage } from "@/db/schema";
import type { ReportData, ReportComparison } from "./types";

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export interface LoadedReport {
  assessment: Assessment;
  report: ReportData;
}

/**
 * Build the full ReportData for an assessment (findings, comparison, log, pages,
 * sitemap, and embedded evidence data-URIs). Shared by the worker PDF render and
 * the on-demand export fallback so the two never drift.
 */
export async function loadReportData(id: string): Promise<LoadedReport> {
  const assessment = await assessmentRepository.findById(id);
  if (!assessment) throw new Error("NOT_FOUND");

  const findings = await assessmentRepository.findFindings(id);
  const comparison = await assessmentRepository.findComparison<ReportComparison>(id);
  const log = await assessmentRepository.readLog(id);
  const pages = parseJson<ScannedPage[]>(assessment.pages, []);
  const sitemapUrls = parseJson<string[]>(assessment.sitemapUrls, []);

  const evidenceImages: ReportData["evidenceImages"] = {};
  const wanted = new Set<string>();
  for (const finding of findings) {
    for (const instance of finding.instances ?? []) {
      if (instance.evidenceId) wanted.add(instance.evidenceId);
    }
  }
  for (const evidenceId of wanted) {
    try {
      const evidence = await evidenceRepository.findById(evidenceId);
      if (evidence) {
        evidenceImages[evidenceId] = {
          mime: evidence.mime,
          dataUri: `data:${evidence.mime};base64,${evidence.image}`,
        };
      }
    } catch {
      /* evidence fetch failed — report stays valid without the image */
    }
  }

  const report: ReportData = {
    id: assessment.id,
    url: assessment.url,
    standard: assessment.standard,
    standardLabel: assessment.standardLabel,
    depth: assessment.depth,
    outcome: assessment.conformance ?? "undetermined",
    scsMet: assessment.scsMet ?? 0,
    scsApplicable: assessment.scsApplicable ?? 0,
    pagesScanned: assessment.pagesScanned,
    partial: assessment.partial,
    score: assessment.score,
    passBand: assessment.passBand,
    reviewStatus: assessment.reviewStatus,
    snapshotAt: assessment.snapshotAt,
    generatedAt: assessment.updatedAt,
    locale: assessment.locale ?? undefined,
    detectedLanguages: parseJson<string[]>(assessment.detectedLanguages, []),
    findings: findings as ReportData["findings"],
    comparison: comparison ?? undefined,
    log,
    pages,
    sitemapUrls,
    sitemapUsed: sitemapUrls.length > 0,
    evidenceImages,
  };

  return { assessment, report };
}
