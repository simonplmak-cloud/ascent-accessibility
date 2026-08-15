import { describe, expect, it } from "vitest";
import {
  buildCsv,
  buildReportHtml,
  exportReport,
  type ReportData,
} from "@/lib/export";

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
    },
    {
      ruleId: "image-alt",
      impact: "moderate",
      description: "Ensures <img> elements have alternate text",
      pageUrl: "https://example.com/",
      elementCount: 1,
      recommendation: 'Add alt="..." to images.',
    },
  ],
};

describe("buildCsv (AC-11)", () => {
  it("emits a header and one row per finding", () => {
    const csv = buildCsv(report);
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe(
      "ruleId,impact,wcagSc,scTitle,sources,confidence,pageUrl,elementCount,description,recommendation",
    );
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain("color-contrast");
  });

  it("escapes commas and quotes in field values", () => {
    const csv = buildCsv({
      ...report,
      findings: [
        {
          ruleId: "image-alt",
          impact: "moderate",
          description: 'Has a "comma, here"',
          pageUrl: "https://example.com/",
          elementCount: 1,
          recommendation: "Fix it.",
        },
      ],
    });
    expect(csv).toContain('"Has a ""comma, here"""');
  });

  it("emits only the header when there are no findings", () => {
    const csv = buildCsv({ ...report, findings: [] });
    expect(csv.trim().split("\n")).toHaveLength(1);
  });
});

describe("buildReportHtml (AC-10)", () => {
  it("includes the score, pass band, and finding details", () => {
    const html = buildReportHtml(report);
    expect(html).toContain("87 / 100");
    expect(html).toContain("partial");
    expect(html).toContain("color-contrast");
    expect(html).toContain("https://example.com/about");
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
  it("returns CSV with the right content type (AC-11)", async () => {
    const result = await exportReport(report, "csv");
    expect(result.contentType).toBe("text/csv");
    expect(result.body.toString()).toContain("ruleId,impact");
  });

  it("returns PDF bytes using the injected renderer (AC-10)", async () => {
    const result = await exportReport(report, "pdf", {
      render: async (html) => Buffer.from(html),
    });
    expect(result.contentType).toBe("application/pdf");
    expect(result.body.toString()).toContain("87 / 100");
  });

  it("rejects an unsupported format", async () => {
    await expect(exportReport(report, "xlsx" as never)).rejects.toThrow(
      /Unsupported export format/,
    );
  });
});
