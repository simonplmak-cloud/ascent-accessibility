import { describe, expect, it } from "vitest";
import { WCAG_SCS } from "@/lib/standards/wcag-sc";
import { instructionsOf } from "@/lib/standards/nature";

describe("instruction/nature taxonomy", () => {
  it("covers 100% of SCs with at least one instruction (AC-3)", () => {
    const uncovered = WCAG_SCS.filter((sc) => instructionsOf(sc.num).length === 0).map(
      (s) => s.num,
    );
    expect(uncovered).toEqual([]);
  });

  it("every instruction has a valid nature (AC-3)", () => {
    for (const sc of WCAG_SCS) {
      for (const inst of instructionsOf(sc.num)) {
        expect(["machine-testable", "ai-detectable", "manual-only"]).toContain(inst.nature);
      }
    }
  });

  it("every machine-testable instruction links to a rule id (AC-4)", () => {
    for (const sc of WCAG_SCS) {
      for (const inst of instructionsOf(sc.num)) {
        if (inst.nature === "machine-testable") {
          expect(inst.method?.ruleId, `${sc.num} has no ruleId`).toBeTruthy();
        }
      }
    }
  });

  it("every ai-detectable instruction names a modality (AC-4)", () => {
    for (const sc of WCAG_SCS) {
      for (const inst of instructionsOf(sc.num)) {
        if (inst.nature === "ai-detectable") {
          expect(["vision", "audio"]).toContain(inst.method?.aiModality);
        }
      }
    }
  });

  it("mixed SCs expose multiple natures (1.1.1) (AC-3)", () => {
    const natures = instructionsOf("1.1.1").map((i) => i.nature);
    expect(natures).toContain("machine-testable");
    expect(natures).toContain("ai-detectable");
    expect(natures).toContain("manual-only");
  });
});
