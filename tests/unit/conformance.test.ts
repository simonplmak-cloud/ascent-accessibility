import { describe, expect, it } from "vitest";
import {
  computeConformance,
  finalizeConformance,
  normalizeFinalVerdict,
  normalizeMachineVerdict,
} from "@/lib/scoring";
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

describe("normalizeFinalVerdict (legacy → official vocabulary)", () => {
  it("passes through official values unchanged", () => {
    expect(normalizeFinalVerdict("Passed")).toBe("Passed");
    expect(normalizeFinalVerdict("Failed")).toBe("Failed");
    expect(normalizeFinalVerdict("CannotTell")).toBe("CannotTell");
    expect(normalizeFinalVerdict("NotPresent")).toBe("NotPresent");
    expect(normalizeFinalVerdict("NotChecked")).toBe("NotChecked");
  });

  it("maps legacy verdicts to official vocabulary", () => {
    expect(normalizeFinalVerdict("compliant")).toBe("Passed");
    expect(normalizeFinalVerdict("violate")).toBe("Failed");
    expect(normalizeFinalVerdict("need-human-checking")).toBe("CannotTell");
    expect(normalizeFinalVerdict("needs-review")).toBe("CannotTell");
    expect(normalizeFinalVerdict("not-applicable")).toBe("NotPresent");
  });

  it("fails safe to CannotTell for unknown values", () => {
    expect(normalizeFinalVerdict("garbage")).toBe("CannotTell");
  });
});

describe("normalizeMachineVerdict", () => {
  it("maps legacy machine verdicts", () => {
    expect(normalizeMachineVerdict("compliant")).toBe("Passed");
    expect(normalizeMachineVerdict("violate")).toBe("Failed");
    expect(normalizeMachineVerdict("need-checking")).toBe("Unresolved");
    expect(normalizeMachineVerdict("not-applicable")).toBe("NotPresent");
  });
});

describe("computeConformance (machine verdict)", () => {
  it("marks failing and passing SCs", () => {
    const result = computeConformance(
      scsForStandard("2.2", "AA"),
      [{ wcagSc: ["1.4.3"] }],
      new Set(["1.4.3", "1.1.1"]),
      FEATURES,
    );
    expect(result.rows.find((r) => r.num === "1.4.3")?.result).toBe("Failed");
    expect(result.rows.find((r) => r.num === "1.1.1")?.result).toBe("Passed");
    expect(result.failed).toBe(1);
  });

  it("marks content-absent SCs as NotPresent", () => {
    const result = computeConformance(scsForStandard("2.2", "A"), [], new Set(), EMPTY_FEATURES);
    expect(result.rows.find((r) => r.num === "1.2.1")?.result).toBe("NotPresent");
    expect(result.rows.find((r) => r.num === "1.1.1")?.result).toBe("NotPresent");
  });

  it("marks applicable-but-untested SCs as Unresolved", () => {
    const result = computeConformance(scsForStandard("2.2", "A"), [], new Set(), FEATURES);
    expect(result.rows.find((r) => r.num === "2.1.1")?.result).toBe("Unresolved");
  });

  it("excludes 4.1.1 for 2.2 but includes it for 2.0", () => {
    expect(scsForStandard("2.2", "A").some((s) => s.num === "4.1.1")).toBe(false);
    expect(scsForStandard("2.0", "A").some((s) => s.num === "4.1.1")).toBe(true);
  });
});

describe("finalizeConformance (final verdict)", () => {
  it("promotes Unresolved via AI-resolved verdicts", () => {
    const machine = computeConformance(scsForStandard("2.2", "A"), [], new Set(), FEATURES);
    const result = finalizeConformance(machine, new Map([["2.1.1", "Passed"]]));
    expect(result.rows.find((r) => r.num === "2.1.1")?.result).toBe("Passed");
    expect(result.rows.find((r) => r.num === "2.1.1")?.machineResult).toBe("Unresolved");
  });

  it("leaves unresolved SCs as CannotTell", () => {
    const machine = computeConformance(scsForStandard("2.2", "A"), [], new Set(), FEATURES);
    const result = finalizeConformance(machine, new Map());
    expect(result.rows.find((r) => r.num === "2.1.1")?.result).toBe("CannotTell");
    expect(result.cannotTell).toBeGreaterThan(0);
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
