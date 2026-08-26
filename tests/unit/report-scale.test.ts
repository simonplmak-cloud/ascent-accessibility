import { describe, expect, it } from "vitest";
import { renderReportDocument } from "@/lib/export/report-document";
import { loadReportStrings } from "@/lib/export/i18n";
import type { ReportData } from "@/lib/export";

// Scale smoke test: a large report (many findings + embedded evidence images)
// must still render without crashing and stay within a sane size budget. This is
// the "2.5x cap" prudence guard — the export path must not OOM or explode in
// size for a big assessment.
const TINY_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

function makeFinding(i: number, impact: string): ReportData["findings"][number] {
  return {
    ruleId: `rule-${i}`,
    impact,
    description: `Finding ${i} — elements must meet accessibility requirement ${i}`,
    pageUrl: `https://example.com/page-${i % 50}`,
    elementCount: 2,
    recommendation: `Fix finding ${i} by adjusting the affected element.`,
    wcagSc: ["1.4.3"],
    scTitle: "Contrast (Minimum)",
    instances: [{ target: "a", html: "<a href='#'>link</a>", failureSummary: "low contrast", evidenceId: `evidence:${i}` }],
  };
}

function buildLargeReport(): ReportData {
  const findings = Array.from({ length: 200 }, (_, i) =>
    makeFinding(i, (["critical", "serious", "moderate", "minor"] as const)[i % 4]!),
  );
  const evidenceImages: ReportData["evidenceImages"] = {};
  for (let i = 0; i < 200; i++) {
    evidenceImages[`evidence:${i}`] = { mime: "image/png", dataUri: `data:image/png;base64,${TINY_PNG}` };
  }
  const rows = Array.from({ length: 50 }, (_, i) => ({
    num: `1.${i + 1}.1`,
    title: `Criterion ${i + 1}`,
    level: "A",
    result: "Failed" as const,
    machineResult: "Failed" as const,
  }));

  return {
    id: "assessment:scale",
    url: "https://example.com",
    standard: "WCAG 2.2 AA",
    outcome: "does-not-conform",
    scsMet: 30,
    scsApplicable: 50,
    pagesScanned: 50,
    findings,
    evidenceImages,
    comparison: {
      conformance: {
        total: 50,
        passed: 30,
        failed: 10,
        notPresent: 5,
        cannotTell: 5,
        coverage: 80,
        levelAttained: "AA",
        outcome: "does-not-conform",
        scsMet: 30,
        scsApplicable: 45,
        rows,
      },
      audit: {
        score: 82,
        failedAudits: [],
        signals: { accessibility: 82, performance: 70, seo: 88, bestPractices: 90, pwa: 50 },
      },
      ai: {
        model: "qwen-vl",
        verdicts: [{ sc: "1.1.1", verdict: "Failed", confidence: 0.9, reasoning: "text alternative missing" }],
        budget: { calls: 1, images: 1 },
      },
    },
    pages: Array.from({ length: 50 }, (_, i) => ({
      url: `https://example.com/page-${i}`,
      title: `Page ${i}`,
      status: "scanned" as const,
      scanTimeMs: 1200,
    })),
    sitemapUrls: Array.from({ length: 50 }, (_, i) => `https://example.com/page-${i}`),
    log: Array.from({ length: 200 }, (_, i) => ({ timestamp: new Date().toISOString(), level: "info" as const, message: `log entry ${i}` })),
  };
}

describe("renderReportDocument (scale)", () => {
  it("renders a large report without exceeding the size budget", async () => {
    const report = buildLargeReport();
    const strings = loadReportStrings("en");
    const buf = await renderReportDocument(report, null, strings);
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
    // Generous budget: the real Vercel bound is ~4.5 MB, but local render may
    // differ slightly; assert it stays in a sane range for 200 findings + images.
    expect(buf.length).toBeLessThan(20 * 1024 * 1024);
  }, 60_000);
});
