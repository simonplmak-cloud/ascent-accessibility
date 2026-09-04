import { describe, expect, it } from "vitest";
import { buildBadgeSvg } from "@/lib/export/badge";
import { buildAcrHtml, vpatLevelOf, acrRemarks, acrIdentity, type AcrInput } from "@/lib/export/acr";
import type { ConformanceRow } from "@/components/assessment/types";
import type { ReportReviewResult } from "@/lib/export/types";

describe("buildBadgeSvg (the Mark)", () => {
  it("renders an SVG with the label, value, and colors", () => {
    const svg = buildBadgeSvg({ label: "accessibility", value: "72 automated", color: "#e3b341" });
    expect(svg).toContain("<svg");
    expect(svg).toContain("accessibility");
    expect(svg).toContain("72 automated");
    expect(svg).toContain("#e3b341"); // automated = amber
    expect(svg).toContain("#2a3542"); // label segment
  });

  it("escapes HTML in the value", () => {
    const svg = buildBadgeSvg({ label: "a", value: "<b>", color: "#fff" });
    expect(svg).toContain("&lt;b&gt;");
    expect(svg).not.toContain("<b>");
  });
});

describe("vpatLevelOf", () => {
  const row = (result: ConformanceRow["result"], machineResult?: ConformanceRow["machineResult"]): ConformanceRow => ({
    num: "1.1.1",
    title: "Non-text Content",
    level: "A",
    result,
    ...(machineResult ? { machineResult } : {}),
  });

  it("maps Passed → supports, Failed → does-not-support, NotPresent → not-applicable", () => {
    expect(vpatLevelOf(row("Passed"))).toBe("supports");
    expect(vpatLevelOf(row("Failed"))).toBe("does-not-support");
    expect(vpatLevelOf(row("NotPresent"))).toBe("not-applicable");
  });

  it("maps unresolved CannotTell → not-evaluated", () => {
    expect(vpatLevelOf(row("CannotTell"))).toBe("not-evaluated");
  });

  it("maps a resolved CannotTell to the resolved verdict's level", () => {
    const resolved: ReportReviewResult = { verdict: "Passed", reviewedBy: "a", reviewedAt: "t" };
    expect(vpatLevelOf(row("CannotTell"), resolved)).toBe("supports");
    expect(vpatLevelOf(row("CannotTell"), { ...resolved, verdict: "Failed" })).toBe("does-not-support");
    expect(vpatLevelOf(row("CannotTell"), { ...resolved, verdict: "NotPresent" })).toBe("not-applicable");
  });
});

describe("acrRemarks", () => {
  const t = (key: string, vars?: Record<string, string | number>): string => {
    if (key === "remarkFailed") return `${vars?.count} finding(s): ${vars?.examples}`;
    if (key === "remarkPassed") return "clean";
    if (key === "remarkNotApplicable") return "n/a";
    if (key === "remarkNotEvaluated") return "needs review";
    if (key === "remarkResolved") return "resolved";
    if (key === "remarkFailedNone") return "no findings";
    return key;
  };

  it("lists findings for a failed criterion", () => {
    const remark = acrRemarks({
      num: "1.4.3",
      result: "Failed",
      findings: [{ wcagSc: ["1.4.3"], description: "Low contrast" }],
      t,
    });
    expect(remark).toContain("Low contrast");
  });

  it("falls back to a plain message for a failed criterion with no findings", () => {
    expect(acrRemarks({ num: "1.4.3", result: "Failed", findings: [], t })).toBe("no findings");
  });

  it("uses the reviewer note when a CannotTell was resolved", () => {
    const resolved: ReportReviewResult = { verdict: "Failed", note: "audited manually", reviewedBy: "a", reviewedAt: "t" };
    expect(acrRemarks({ num: "1.1.1", result: "CannotTell", findings: [], reviewResult: resolved, t })).toBe("audited manually");
    expect(acrRemarks({ num: "1.1.1", result: "CannotTell", findings: [], reviewResult: { verdict: "Failed", reviewedBy: "a", reviewedAt: "t" }, t })).toBe("resolved");
  });
});

describe("acrIdentity", () => {
  it("returns empty identity for an unreviewed draft", () => {
    expect(acrIdentity(null, false)).toEqual({ reviewerName: "", organization: "", email: "" });
  });

  it("returns the reviewer identity when reviewed", () => {
    expect(
      acrIdentity({ reviewerName: "Jane", organization: "Acme", email: "jane@acme.test" }, true),
    ).toEqual({ reviewerName: "Jane", organization: "Acme", email: "jane@acme.test" });
  });
});

describe("buildAcrHtml (draft ACR)", () => {
  const rows: ConformanceRow[] = [
    { num: "1.1.1", title: "Non-text Content", level: "A", result: "Passed", machineResult: "Passed" },
    { num: "1.4.3", title: "Contrast (Minimum)", level: "AA", result: "Failed", machineResult: "Failed" },
    { num: "2.4.7", title: "Focus Visible", level: "AA", result: "CannotTell" },
  ];
  const input: AcrInput = {
    url: "https://example.com",
    standard: "WCAG 2.2 AA",
    date: "today",
    productName: "example.com",
    productVersion: "N/A — website",
    evaluator: "Ascent Accessibility automated engine (no human evaluator)",
    contact: "hello@example.com",
    evaluationMethods: ["Automated rule engine + AI-assisted review"],
    notes: [],
    reviewed: false,
    coverage: 60,
    total: 3,
    passed: 1,
    failed: 1,
    cannotTell: 1,
    rows,
  };

  it("is clearly labelled as a draft, not independently verified", () => {
    const html = buildAcrHtml(input);
    expect(html).toContain("DRAFT");
    expect(html).toContain("not independently verified");
    expect(html).toContain("not a procurement-grade ACR");
  });

  it("maps results to VPAT conformance levels", () => {
    const html = buildAcrHtml(input);
    expect(html).toContain("Supports");
    expect(html).toContain("Does Not Support");
    expect(html).toContain("Not Evaluated");
  });

  it("includes title-page fields, a remarks column, and the rows", () => {
    const html = buildAcrHtml(input);
    expect(html).toContain("https://example.com");
    expect(html).toContain("Product name");
    expect(html).toContain("Evaluator");
    expect(html).toContain("Remarks");
    expect(html).toContain("1.1.1");
    expect(html).toContain("Contrast (Minimum)");
  });

  it("escapes HTML in content", () => {
    const html = buildAcrHtml({ ...input, url: "https://x.com/<script>" });
    expect(html).not.toContain("<script>");
  });
});

describe("buildAcrHtml (reviewed ACR)", () => {
  const rows: ConformanceRow[] = [
    { num: "1.1.1", title: "Non-text Content", level: "A", result: "CannotTell" },
  ];
  const reviewResults: Record<string, ReportReviewResult> = {
    "1.1.1": { verdict: "Passed", note: "verified with NVDA", reviewedBy: "jane@acme.test", reviewedAt: "t" },
  };
  const input: AcrInput = {
    url: "https://example.com",
    standard: "WCAG 2.2 AA",
    date: "today",
    productName: "example.com",
    productVersion: "N/A — website",
    evaluator: "Jane — Acme",
    contact: "jane@acme.test",
    evaluationMethods: ["NVDA + Chrome"],
    notes: [],
    reviewed: true,
    coverage: 100,
    total: 1,
    passed: 1,
    failed: 0,
    cannotTell: 0,
    rows,
    reviewResults,
  };

  it("renders a signed banner and the reviewer note", () => {
    const html = buildAcrHtml(input);
    expect(html).toContain("Signed conformance report");
    expect(html).not.toContain("DRAFT");
    expect(html).toContain("verified with NVDA");
  });
});
