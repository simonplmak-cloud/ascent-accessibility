import { describe, expect, it } from "vitest";
import { computeConformance, computeScore } from "@/lib/scoring";
import { EMPTY_FEATURES, type PageFeatures } from "@/lib/standards/sc-applicability";

const FEATURES: PageFeatures = {
  ...EMPTY_FEATURES,
  hasContent: true,
  hasImages: true,
  hasLinks: true,
  hasInteractive: true,
  hasHeadings: true,
  hasLang: true,
  hasForms: true,
};

describe("computeScore", () => {
  it("weights findings by impact and instance frequency (capped)", () => {
    expect(computeScore([{ impact: "critical", elementCount: 1 }]).score).toBe(90);
    expect(computeScore([{ impact: "critical", elementCount: 3 }]).score).toBe(70);
    expect(computeScore([{ impact: "critical", elementCount: 20 }]).score).toBe(0);
  });
});

describe("computeConformance", () => {
  it("marks failing and passing SCs", () => {
    const result = computeConformance(
      [{ wcagSc: ["1.4.3"] }],
      new Set(["1.4.3", "1.1.1"]),
      FEATURES,
      "AA",
    );
    expect(result.rows.find((r) => r.num === "1.4.3")?.result).toBe("fail");
    expect(result.rows.find((r) => r.num === "1.1.1")?.result).toBe("pass");
    expect(result.failed).toBe(1);
  });

  it("marks content-absent SCs as not-applicable", () => {
    const result = computeConformance([], new Set(), EMPTY_FEATURES, "A");
    expect(result.rows.find((r) => r.num === "1.2.1")?.result).toBe("not-applicable");
    expect(result.rows.find((r) => r.num === "1.1.1")?.result).toBe("not-applicable");
  });

  it("marks applicable-but-untested SCs as needs-review", () => {
    const result = computeConformance([], new Set(), FEATURES, "A");
    expect(result.rows.find((r) => r.num === "2.1.1")?.result).toBe("needs-review");
  });

  it("does not claim a conformance level while SCs await review", () => {
    const result = computeConformance([], new Set(), FEATURES, "A");
    expect(result.levelAttained).toBe("none");
    expect(result.needsReview).toBeGreaterThan(0);
  });

  it("claims a level when every applicable SC is satisfied", () => {
    // no content at all → everything is not-applicable (satisfied)
    const result = computeConformance([], new Set(), EMPTY_FEATURES, "AA");
    expect(result.levelAttained).toBe("AA");
  });
});
