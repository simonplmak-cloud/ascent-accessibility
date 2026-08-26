import { describe, expect, it } from "vitest";
import {
  HUMAN_DECISION_CATEGORIES,
  HUMAN_DECISION_SCS,
  RECLASSIFIED_SCS,
  humanDecisionFor,
  type HumanDecisionCategory,
} from "@/lib/standards/human-decision";
import { NOT_APPLICABLE, naturesOf } from "@/lib/standards/nature";
import { scsForStandard } from "@/lib/standards/version";

describe("human-decision taxonomy", () => {
  it("maps every SC to a valid category", () => {
    const categories = new Set(Object.keys(HUMAN_DECISION_CATEGORIES));
    for (const [sc, entry] of Object.entries(HUMAN_DECISION_SCS)) {
      expect(categories.has(entry.category), `${sc} category ${entry.category}`).toBe(true);
      expect(entry.humanDecisionPoint.trim()).not.toBe("");
    }
  });

  it("gives every category a whyNotAi and a pathToAi (no permanently human)", () => {
    for (const [cat, def] of Object.entries(HUMAN_DECISION_CATEGORIES)) {
      expect(def.whyNotAi.trim(), `${cat} whyNotAi`).not.toBe("");
      expect(def.pathToAi.trim(), `${cat} pathToAi`).not.toBe("");
    }
  });

  it("uses every category for at least one SC", () => {
    const used = new Set(Object.values(HUMAN_DECISION_SCS).map((e) => e.category));
    for (const cat of Object.keys(HUMAN_DECISION_CATEGORIES) as HumanDecisionCategory[]) {
      expect(used.has(cat), `category ${cat} is unused`).toBe(true);
    }
  });

  it("keeps the reclassified set disjoint from the residual table", () => {
    for (const sc of RECLASSIFIED_SCS) {
      expect(HUMAN_DECISION_SCS[sc], `${sc} should not be both reclassified and residual`).toBeUndefined();
    }
  });

  it("covers every manual-only SC (residual ∪ reclassified = all, disjoint)", () => {
    const allScs = scsForStandard("2.2", "AAA").map((s) => s.num);
    const manualNeedsHuman = allScs.filter(
      (sc) => !NOT_APPLICABLE.includes(sc) && naturesOf(sc).has("manual-only"),
    );
    const covered = new Set([...Object.keys(HUMAN_DECISION_SCS), ...RECLASSIFIED_SCS]);
    const missing = manualNeedsHuman.filter((sc) => !covered.has(sc));
    expect(missing).toEqual([]);
  });

  it("resolves a decision for a known SC", () => {
    expect(humanDecisionFor("2.1.3")?.category).toBe("interaction");
    expect(humanDecisionFor("1.2.4")).toBeUndefined(); // not-applicable, not human
    expect(humanDecisionFor("1.1.1")?.category).toBe("editorial");
  });
});
