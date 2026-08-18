import { describe, expect, it } from "vitest";
import { buildReportSummary } from "@/lib/report-summary";
import type { AssessmentResult, Conformance, Finding } from "@/components/assessment/types";

function finding(ruleId: string): Finding {
  return {
    ruleId,
    impact: "serious",
    description: "d",
    pageUrl: "u",
    elementCount: 1,
    recommendation: "r",
  };
}

function conformance(violatingRows: Array<{ num: string; title: string }>): Conformance {
  return {
    total: 50,
    passed: 50 - violatingRows.length,
    failed: violatingRows.length,
    notPresent: 0,
    cannotTell: 0,
    coverage: 100,
    levelAttained: "AA",
    rows: violatingRows.map((r) => ({ ...r, level: "AA", result: "Failed" as const })),
  };
}

function result(overrides: Partial<AssessmentResult> = {}): AssessmentResult {
  return {
    id: "assessment:1",
    status: "completed",
    partial: false,
    url: "https://example.com",
    standard: "WCAG 2.2 AA",
    score: 88,
    passBand: "partial",
    pagesScanned: 12,
    log: [],
    findings: [],
    comparison: {
      audit: { score: 100, failedAudits: [] },
      conformance: conformance([]),
    },
    ...overrides,
  };
}

describe("buildReportSummary", () => {
  it("summarises score, band, findings, pages, and failed criteria", () => {
    const s = buildReportSummary(
      result({
        findings: [finding("a"), finding("b")],
        comparison: {
          ...result().comparison!,
          conformance: conformance([{ num: "1.4.3", title: "Contrast (Minimum)" }]),
        },
      }),
    );
    expect(s).toContain("scores 88 out of 100");
    expect(s).toContain("a partial result");
    expect(s).toContain("2 findings");
    expect(s).toContain("12 pages");
    expect(s).toContain("fails 1 success criterion");
    expect(s).toContain("1.4.3 Contrast (Minimum)");
  });

  it("uses singular and notes no failures when clean", () => {
    const s = buildReportSummary(result({ findings: [finding("a")] }));
    expect(s).toContain("1 finding");
    expect(s).toContain("No success criteria failed");
  });
});
