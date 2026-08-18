import { describe, expect, it } from "vitest";
import { exportReport, type ReportData } from "@/lib/export";

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
};

describe("exportReport", () => {
  it("returns PDF bytes using the injected renderer", async () => {
    const result = await exportReport(report, "pdf", {
      render: async (r) => Buffer.from(`rendered ${r.url}`),
    });
    expect(result.contentType).toBe("application/pdf");
    expect(result.body.toString()).toContain("rendered https://example.com/");
  });

  it("passes the full report data to the renderer", async () => {
    let received: ReportData | undefined;
    await exportReport(report, "pdf", {
      render: async (r) => {
        received = r;
        return Buffer.from("x");
      },
    });
    expect(received?.outcome).toBe("does-not-conform");
    expect(received?.findings).toHaveLength(1);
  });

  it("rejects an unsupported format", async () => {
    await expect(exportReport(report, "xlsx" as never)).rejects.toThrow(
      /Unsupported export format/,
    );
  });
});
