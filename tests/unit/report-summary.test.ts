import { describe, expect, it } from "vitest";
import { buildReportSummary } from "@/lib/report/report-summary";
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
  const failed = violatingRows.length;
  const passed = 50 - failed;
  return {
    total: 50,
    passed,
    failed,
    notPresent: 0,
    cannotTell: 0,
    coverage: 100,
    levelAttained: "AA",
    outcome: failed > 0 ? "does-not-conform" : "conforms",
    scsMet: passed,
    scsApplicable: 50,
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
    score: null,
    passBand: null,
    conformance: "does-not-conform",
    scsMet: 49,
    scsApplicable: 50,
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
  it("summarises findings, pages, failed criteria, and the outcome", () => {
    const s = buildReportSummary(
      result({
        reviewStatus: "reviewed",
        findings: [finding("a"), finding("b")],
        comparison: {
          ...result().comparison!,
          conformance: conformance([{ num: "1.4.3", title: "Contrast (Minimum)" }]),
        },
      }),
    );
    expect(s).toContain("was assessed across 12 pages");
    expect(s).toContain("with 2 findings");
    expect(s).toContain("fails 1 success criterion");
    expect(s).toContain("1.4.3 Contrast (Minimum)");
    expect(s).toContain("It does not conform to the selected standard.");
  });

  it("uses singular and notes no failures when clean", () => {
    const s = buildReportSummary(result({ reviewStatus: "reviewed", findings: [finding("a")] }));
    expect(s).toContain("with 1 finding");
    expect(s).toContain("No success criteria failed");
    expect(s).toContain("It conforms to the selected standard.");
  });

  it("reports undetermined when reviewed criteria still await human review", () => {
    const s = buildReportSummary(
      result({
        reviewStatus: "reviewed",
        comparison: {
          ...result().comparison!,
          conformance: {
            ...conformance([]),
            cannotTell: 3,
            outcome: "undetermined",
            scsApplicable: 50,
            scsMet: 47,
          },
        },
      }),
    );
    expect(s).toContain("3 cannot be determined and need human review");
    expect(s).toContain("Conformance has not yet been determined.");
  });

  it("reports a partial result for an unreviewed (automated/AI-only) assessment", () => {
    const s = buildReportSummary(
      result({
        comparison: {
          ...result().comparison!,
          conformance: {
            ...conformance([{ num: "1.4.3", title: "Contrast (Minimum)" }]),
            cannotTell: 3,
            outcome: "undetermined",
          },
        },
      }),
    );
    expect(s).toContain("This is a partial result");
    expect(s).not.toContain("It does not conform to the selected standard.");
  });
});
