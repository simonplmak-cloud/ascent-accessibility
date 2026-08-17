import { describe, expect, it } from "vitest";
import {
  conformanceBarChart,
  passBandColor,
  scoreGauge,
  severityBarChart,
  severityColor,
  severityCounts,
} from "@/lib/export/charts";

describe("severityCounts", () => {
  it("counts findings by severity", () => {
    const counts = severityCounts([
      { impact: "critical" },
      { impact: "critical" },
      { impact: "serious" },
      { impact: "minor" },
    ]);
    expect(counts).toEqual({ critical: 2, serious: 1, moderate: 0, minor: 1 });
  });

  it("treats an unknown impact as minor", () => {
    expect(severityCounts([{ impact: "weird" }]).minor).toBe(1);
  });

  it("returns zeros for an empty list", () => {
    expect(severityCounts([])).toEqual({ critical: 0, serious: 0, moderate: 0, minor: 0 });
  });
});

describe("severityColor / passBandColor", () => {
  it("maps known severities and bands", () => {
    expect(severityColor("critical")).toBe("#d1242f");
    expect(severityColor("serious")).toBe("#bc4c00");
    expect(passBandColor("pass")).toBe("#1a7f37");
    expect(passBandColor("partial")).toBe("#9a6700");
    expect(passBandColor("fail")).toBe("#d1242f");
  });

  it("falls back for unknown values", () => {
    expect(severityColor("nope")).toBe("#59636e");
    expect(passBandColor("nope")).toBe("#59636e");
  });
});

describe("scoreGauge", () => {
  it("renders the score, a label, and the pass-band colour", () => {
    const svg = scoreGauge(87, "#9a6700");
    expect(svg).toContain("87");
    expect(svg).toContain("out of 100");
    expect(svg).toContain("#9a6700");
    expect(svg).toContain('role="img"');
  });

  it("clamps the score to 0..100", () => {
    expect(scoreGauge(150, "#1a7f37")).toContain("Accessibility score 100");
    expect(scoreGauge(-5, "#1a7f37")).toContain("Accessibility score 0");
  });
});

describe("severityBarChart", () => {
  it("renders each severity label and its count", () => {
    const svg = severityBarChart({ critical: 2, serious: 1, moderate: 0, minor: 3 });
    for (const label of ["critical", "serious", "moderate", "minor"]) {
      expect(svg).toContain(`>${label}</text>`);
    }
    expect(svg).toContain(">2</text>");
    expect(svg).toContain(">3</text>");
  });

  it("renders an empty state without error", () => {
    const svg = severityBarChart({ critical: 0, serious: 0, moderate: 0, minor: 0 });
    expect(svg).toContain("Findings by severity");
  });
});

describe("conformanceBarChart", () => {
  it("renders a legend with counts for each outcome", () => {
    const html = conformanceBarChart({
      passed: 40,
      failed: 3,
      notApplicable: 5,
      needsReview: 2,
    });
    expect(html).toContain("Pass (40)");
    expect(html).toContain("Fail (3)");
    expect(html).toContain("Not applicable (5)");
    expect(html).toContain("Needs review (2)");
  });

  it("renders an empty state when there is no data", () => {
    const html = conformanceBarChart({
      passed: 0,
      failed: 0,
      notApplicable: 0,
      needsReview: 0,
    });
    expect(html).toContain("No conformance data");
  });
});
