import { describe, expect, it } from "vitest";
import { renderReportDocument } from "@/lib/export/report-document";
import { loadReportStrings } from "@/lib/export/i18n";
import type { ReportData } from "@/lib/export";

// Smoke test: actually renders the PDF (react-pdf) with the three review-method
// sections present, so a JSX/react-pdf error in them fails loudly here.
const report: ReportData = {
  url: "https://example.com/",
  standard: "WCAG 2.2 AA",
  outcome: "does-not-conform",
  scsMet: 49,
  scsApplicable: 50,
  pagesScanned: 5,
  findings: [
    {
      ruleId: "color-contrast",
      impact: "serious",
      description: "Elements must meet minimum color contrast ratio thresholds",
      pageUrl: "https://example.com/about",
      elementCount: 3,
      recommendation: "Increase text contrast to at least 4.5:1.",
      wcagSc: ["1.4.3"],
      scTitle: "Contrast (Minimum)",
    },
  ],
  comparison: {
    conformance: {
      total: 50,
      passed: 30,
      failed: 5,
      notPresent: 10,
      cannotTell: 5,
      coverage: 80,
      levelAttained: "AA",
      outcome: "does-not-conform",
      scsMet: 30,
      scsApplicable: 40,
      rows: [
        { num: "1.1.1", title: "Non-text Content", level: "A", result: "Failed", machineResult: "Failed" },
        { num: "1.4.3", title: "Contrast (Minimum)", level: "AA", result: "Passed", machineResult: "Passed" },
        { num: "2.4.7", title: "Focus Visible", level: "AA", result: "CannotTell", machineResult: "Unresolved" },
      ],
    },
    ai: {
      model: "qwen-vl",
      verdicts: [
        { sc: "2.4.7", verdict: "CannotTell", confidence: 0.5, reasoning: "Cannot tell from the screenshot." },
      ],
      budget: { calls: 1, images: 1 },
    },
  },
};

describe("renderReportDocument (review-method sections)", () => {
  it("renders a PDF buffer including machine / AI / human review sections", async () => {
    const strings = await loadReportStrings("en");
    const buf = await renderReportDocument(report, null, strings);
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  }, 30000);

  it("renders a reviewed report (conformance claim + resolved results) without error", async () => {
    const strings = await loadReportStrings("en");
    const reviewed: ReportData = {
      ...report,
      reviewStatus: "reviewed",
      reviewClaim: {
        reviewerName: "Jane Reviewer",
        organization: "Acme Auditors",
        email: "jane@acme.test",
        evaluationMethods: ["NVDA + Chrome", "Keyboard only"],
      },
      reviewResults: {
        "2.4.7": { verdict: "Passed", note: "Verified focus ring with NVDA.", reviewedBy: "jane@acme.test", reviewedAt: "2026-09-04T10:00:00Z" },
      },
      conformanceClaim: {
        outcome: "does-not-conform",
        scsMet: 30,
        scsApplicable: 40,
        reviewer: "Jane Reviewer",
        organization: "Acme Auditors",
        asAt: "2026-09-04T09:00:00Z",
        signedAt: "2026-09-04T10:00:00Z",
      },
    };
    const buf = await renderReportDocument(reviewed, null, strings);
    expect(buf.length).toBeGreaterThan(0);
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  }, 30000);
});
