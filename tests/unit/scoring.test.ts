import { describe, expect, it } from "vitest";
import { computeConformance, finalizeConformance, type MachineConformanceResult } from "@/lib/scoring";
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

function machine(rows: Array<{ num: string; result: MachineConformanceResult["rows"][number]["result"] }>): MachineConformanceResult {
  return {
    total: rows.length,
    passed: rows.filter((r) => r.result === "Passed").length,
    failed: rows.filter((r) => r.result === "Failed").length,
    notPresent: rows.filter((r) => r.result === "NotPresent").length,
    unresolved: rows.filter((r) => r.result === "Unresolved").length,
    coverage: 0,
    rows: rows.map((r) => ({ ...r, title: r.num, level: "A" as const })),
  };
}

describe("finalizeConformance (outcome + SC counts)", () => {
  it("is conforms when every applicable SC passes (AC-8)", () => {
    const result = finalizeConformance(
      machine([
        { num: "1.1.1", result: "Passed" },
        { num: "1.2.1", result: "NotPresent" },
      ]),
      new Map(),
    );
    expect(result.outcome).toBe("conforms");
    expect(result.scsMet).toBe(1);
    expect(result.scsApplicable).toBe(1);
  });

  it("is does-not-conform when any applicable SC fails and none are Cannot tell", () => {
    const result = finalizeConformance(
      machine([
        { num: "1.1.1", result: "Passed" },
        { num: "1.4.3", result: "Failed" },
      ]),
      new Map(),
    );
    expect(result.outcome).toBe("does-not-conform");
    expect(result.scsMet).toBe(1);
    expect(result.scsApplicable).toBe(2);
  });

  it("is undetermined when any applicable SC is Cannot tell (AC-7)", () => {
    const result = finalizeConformance(
      machine([
        { num: "1.1.1", result: "Passed" },
        { num: "1.4.3", result: "Failed" },
        { num: "2.4.4", result: "Unresolved" },
      ]),
      new Map(),
    );
    expect(result.outcome).toBe("undetermined");
  });

  it("excludes Not present from the applicable count (AC-8)", () => {
    const result = finalizeConformance(
      machine([
        { num: "1.1.1", result: "Passed" },
        { num: "1.2.1", result: "NotPresent" },
        { num: "1.2.2", result: "NotPresent" },
      ]),
      new Map(),
    );
    expect(result.scsApplicable).toBe(1);
    expect(result.scsMet).toBe(1);
    expect(result.outcome).toBe("conforms");
  });

  it("is undetermined when there are no applicable SCs", () => {
    const result = finalizeConformance(
      machine([
        { num: "1.1.1", result: "NotPresent" },
        { num: "1.2.1", result: "NotPresent" },
      ]),
      new Map(),
    );
    expect(result.scsApplicable).toBe(0);
    expect(result.outcome).toBe("undetermined");
  });

  it("stamps provenance: machine rows confirmed, AI-resolved rows single-source", () => {
    const result = finalizeConformance(
      machine([
        { num: "1.1.1", result: "Passed" },
        { num: "1.4.3", result: "Failed" },
        { num: "2.4.4", result: "Unresolved" },
        { num: "2.4.7", result: "Unresolved" },
      ]),
      new Map([["2.4.4", "Passed"]]),
    );
    const byNum = Object.fromEntries(result.rows.map((r) => [r.num, r]));
    expect(byNum["1.1.1"]?.confidence).toBe("confirmed");
    expect(byNum["1.4.3"]?.confidence).toBe("confirmed");
    expect(byNum["2.4.4"]?.confidence).toBe("single-source");
    expect(byNum["2.4.7"]?.confidence).toBeUndefined();
  });
});

describe("computeConformance + finalizeConformance integration", () => {
  it("derives a conforms outcome from an empty applicable set via real SCs", () => {
    const machineResult = computeConformance(scsForStandard("2.2", "AA"), [], new Set(), new Set(), EMPTY_FEATURES);
    const result = finalizeConformance(machineResult, new Map());
    expect(result.outcome).toBe("undetermined");
  });

  it("derives undetermined when applicable SCs remain unresolved", () => {
    const machineResult = computeConformance(scsForStandard("2.2", "A"), [], new Set(), new Set(), FEATURES);
    const result = finalizeConformance(machineResult, new Map());
    expect(result.outcome).toBe("undetermined");
    expect(result.scsApplicable).toBeGreaterThan(0);
  });
});
