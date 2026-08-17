import { describe, expect, it } from "vitest";
import { buildReportHtml, exportReport, type ReportData } from "@/lib/export";

const report: ReportData = {
  url: "https://example.com/",
  standard: "WCAG 2.2 AA",
  score: 87,
  passBand: "partial",
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
    {
      ruleId: "image-alt",
      impact: "moderate",
      description: "Ensures <img> elements have alternate text",
      pageUrl: "https://example.com/",
      elementCount: 1,
      recommendation: 'Add alt="..." to images.',
      wcagSc: ["1.1.1"],
      scTitle: "Non-text Content",
    },
  ],
};

describe("buildReportHtml (professional report)", () => {
  it("includes the cover, table of contents, and all core sections", () => {
    const html = buildReportHtml(report);
    expect(html).toContain("Web Accessibility Assessment Report");
    expect(html).toContain("Table of contents");
    expect(html).toContain("Executive summary");
    expect(html).toContain("Methodology");
    expect(html).toContain("WCAG conformance");
    expect(html).toContain("Severity distribution");
    expect(html).toContain("Findings");
    expect(html).toContain("Remediation recommendations");
  });

  it("shows the score and the result verdict", () => {
    const html = buildReportHtml(report);
    expect(html).toContain("score 87 / 100");
    expect(html).toContain("Result: partial");
  });

  it("groups findings by severity with WCAG SC and recommendation", () => {
    const html = buildReportHtml(report);
    expect(html).toContain("Serious (1)");
    expect(html).toContain("Moderate (1)");
    expect(html).toContain("color-contrast");
    expect(html).toContain("1.4.3");
    expect(html).toContain("Increase text contrast to at least 4.5:1.");
  });

  it("includes an affected-success-criteria table from findings", () => {
    const html = buildReportHtml({ ...report, comparison: { conformance: conformanceFixture() } });
    expect(html).toContain("Affected success criteria");
    expect(html).toContain("1.4.3");
    expect(html).toContain("Contrast (Minimum)");
  });

  it("includes the cross-tool comparison section only when comparison data exists", () => {
    expect(buildReportHtml(report)).not.toContain("Cross-tool comparison");

    const html = buildReportHtml({
      ...report,
      comparison: { lighthouse: { score: 79 }, conformance: conformanceFixture() },
    });
    expect(html).toContain("Cross-tool comparison");
    expect(html).toContain("Lighthouse (comparable)");
  });

  it("renders empty-findings state without error", () => {
    const html = buildReportHtml({ ...report, findings: [] });
    expect(html).toContain("No automated findings detected");
    expect(html).not.toContain("Serious (");
  });

  it("escapes HTML in user-controlled fields", () => {
    const html = buildReportHtml({
      ...report,
      findings: [
        {
          ruleId: "xss",
          impact: "serious",
          description: "<script>alert(1)</script>",
          pageUrl: "https://example.com/",
          elementCount: 1,
          recommendation: "&amp; fix",
        },
      ],
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("exportReport", () => {
  it("returns PDF bytes using the injected renderer", async () => {
    const result = await exportReport(report, "pdf", {
      render: async (html) => Buffer.from(html),
    });
    expect(result.contentType).toBe("application/pdf");
    expect(result.body.toString()).toContain("Web Accessibility Assessment Report");
  });

  it("rejects an unsupported format", async () => {
    await expect(exportReport(report, "xlsx" as never)).rejects.toThrow(
      /Unsupported export format/,
    );
  });
});

function conformanceFixture() {
  return {
    total: 50,
    passed: 40,
    failed: 3,
    notApplicable: 5,
    needsReview: 2,
    coverage: 80,
    levelAttained: "AA",
  };
}
