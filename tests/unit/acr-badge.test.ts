import { describe, expect, it } from "vitest";
import { buildBadgeSvg } from "@/lib/export/badge";
import { buildAcrHtml } from "@/lib/export/acr";
import type { ConformanceRow } from "@/components/assessment/types";

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

describe("buildAcrHtml (draft ACR)", () => {
  const rows: ConformanceRow[] = [
    { num: "1.1.1", title: "Non-text Content", level: "A", result: "Passed", machineResult: "Passed" },
    { num: "1.4.3", title: "Contrast (Minimum)", level: "AA", result: "Failed", machineResult: "Failed" },
    { num: "2.4.7", title: "Focus Visible", level: "AA", result: "CannotTell" },
  ];
  const input = {
    url: "https://example.com",
    standard: "WCAG 2.2 AA",
    date: "today",
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
    expect(html).toContain("Not evaluated — needs human review");
  });

  it("includes the URL and the criteria rows", () => {
    const html = buildAcrHtml(input);
    expect(html).toContain("https://example.com");
    expect(html).toContain("1.1.1");
    expect(html).toContain("Contrast (Minimum)");
  });

  it("escapes HTML in content", () => {
    const html = buildAcrHtml({ ...input, url: "https://x.com/<script>" });
    expect(html).not.toContain("<script>");
  });
});
