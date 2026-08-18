import { describe, expect, it } from "vitest";
import { computeConformance, computeScore, finalizeConformance } from "@/lib/scoring";
import { EMPTY_FEATURES, type PageFeatures } from "@/lib/standards/sc-applicability";
import { scsForStandard } from "@/lib/standards/version";

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

describe("computeConformance (machine verdict)", () => {
  it("marks violating and compliant SCs", () => {
    const result = computeConformance(
      scsForStandard("2.2", "AA"),
      [{ wcagSc: ["1.4.3"] }],
      new Set(["1.4.3", "1.1.1"]),
      FEATURES,
    );
    expect(result.rows.find((r) => r.num === "1.4.3")?.result).toBe("violate");
    expect(result.rows.find((r) => r.num === "1.1.1")?.result).toBe("compliant");
    expect(result.violate).toBe(1);
  });

  it("marks content-absent SCs as not-applicable", () => {
    const result = computeConformance(scsForStandard("2.2", "A"), [], new Set(), EMPTY_FEATURES);
    expect(result.rows.find((r) => r.num === "1.2.1")?.result).toBe("not-applicable");
    expect(result.rows.find((r) => r.num === "1.1.1")?.result).toBe("not-applicable");
  });

  it("marks applicable-but-untested SCs as need-checking", () => {
    const result = computeConformance(scsForStandard("2.2", "A"), [], new Set(), FEATURES);
    expect(result.rows.find((r) => r.num === "2.1.1")?.result).toBe("need-checking");
  });

  it("excludes 4.1.1 for 2.2 but includes it for 2.0", () => {
    expect(scsForStandard("2.2", "A").some((s) => s.num === "4.1.1")).toBe(false);
    expect(scsForStandard("2.0", "A").some((s) => s.num === "4.1.1")).toBe(true);
  });
});

describe("finalizeConformance (final verdict)", () => {
  it("promotes need-checking via AI-resolved verdicts", () => {
    const machine = computeConformance(scsForStandard("2.2", "A"), [], new Set(), FEATURES);
    const result = finalizeConformance(machine, new Map([["2.1.1", "compliant"]]));
    expect(result.rows.find((r) => r.num === "2.1.1")?.result).toBe("compliant");
    expect(result.rows.find((r) => r.num === "2.1.1")?.machineResult).toBe("need-checking");
  });

  it("leaves unresolved need-checking as need-human-checking", () => {
    const machine = computeConformance(scsForStandard("2.2", "A"), [], new Set(), FEATURES);
    const result = finalizeConformance(machine, new Map());
    expect(result.rows.find((r) => r.num === "2.1.1")?.result).toBe("need-human-checking");
    expect(result.needHumanChecking).toBeGreaterThan(0);
  });

  it("does not claim a level while SCs await human check", () => {
    const machine = computeConformance(scsForStandard("2.2", "A"), [], new Set(), FEATURES);
    expect(finalizeConformance(machine, new Map()).levelAttained).toBe("none");
  });

  it("claims a level when every applicable SC is satisfied", () => {
    const machine = computeConformance(scsForStandard("2.2", "AA"), [], new Set(), EMPTY_FEATURES);
    expect(finalizeConformance(machine, new Map()).levelAttained).toBe("AA");
  });
});
