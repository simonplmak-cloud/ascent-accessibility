import { describe, expect, it } from "vitest";
import {
  ALWAYS_APPLICABLE,
  FEATURE_ROUTED_SCS,
  isScApplicable,
  MATCHER_EXHAUSTIVE,
  MACHINE_SCS,
} from "@/lib/standards/sc-coverage";
import { EMPTY_FEATURES } from "@/lib/standards/sc-applicability";
import { ALL_RULES } from "@/lib/engine/rules";
import { getSc } from "@/lib/standards/wcag-sc";

describe("sc-coverage", () => {
  it("every machine-rule wcagSc resolves against the catalog", () => {
    for (const rule of ALL_RULES) {
      for (const sc of rule.wcagSc) {
        expect(getSc(sc)).toBeDefined();
      }
    }
  });

  it("every MATCHER_EXHAUSTIVE SC is a machine SC", () => {
    for (const sc of MATCHER_EXHAUSTIVE) {
      expect(MACHINE_SCS.has(sc)).toBe(true);
    }
  });

  it("every FEATURE_ROUTED_SCS SC is a machine SC", () => {
    for (const sc of FEATURE_ROUTED_SCS) {
      expect(MACHINE_SCS.has(sc)).toBe(true);
    }
  });

  it("Non-Interference SCs are always applicable, never not-applicable", () => {
    for (const sc of ALWAYS_APPLICABLE) {
      expect(isScApplicable(sc, new Set(), EMPTY_FEATURES)).toBe("applicable");
    }
  });

  it("exhaustive machine SC is not-applicable when nothing matched", () => {
    expect(isScApplicable("1.2.1", new Set(), EMPTY_FEATURES)).toBe("not-applicable");
  });

  it("exhaustive machine SC is applicable when its matcher matched", () => {
    expect(isScApplicable("1.2.1", new Set(["1.2.1"]), EMPTY_FEATURES)).toBe("applicable");
  });

  it("partial machine SC stays applicable on absence (Cannot tell, never NotPresent)", () => {
    expect(isScApplicable("1.1.1", new Set(), EMPTY_FEATURES)).toBe("applicable");
  });

  it("feature-routed machine SC uses feature flags", () => {
    expect(isScApplicable("1.3.5", new Set(), EMPTY_FEATURES)).toBe("not-applicable");
    expect(isScApplicable("1.3.5", new Set(), { ...EMPTY_FEATURES, hasForms: true })).toBe("applicable");
  });

  it("non-machine SC falls back to feature flags", () => {
    expect(isScApplicable("1.3.2", new Set(), EMPTY_FEATURES)).toBe("not-applicable");
    expect(isScApplicable("1.3.2", new Set(), { ...EMPTY_FEATURES, hasContent: true })).toBe("applicable");
  });
});
