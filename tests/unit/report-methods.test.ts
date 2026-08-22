import { describe, expect, it } from "vitest";
import { aiResults, combinedSummary, humanReviewPending, machineResults } from "@/lib/report-methods";
import type { Conformance, ConformanceRow } from "@/components/assessment/types";

function row(overrides: Partial<ConformanceRow>): ConformanceRow {
  return { num: "1.1.1", title: "t", level: "A", result: "Passed", ...overrides };
}

const rows: ConformanceRow[] = [
  row({ num: "1.1.1", result: "Passed", machineResult: "Passed" }), // machine pass
  row({ num: "1.4.3", result: "Failed", machineResult: "Failed" }), // machine fail
  row({ num: "2.4.7", result: "CannotTell", machineResult: "Unresolved" }), // needs human
  row({ num: "1.2.1", result: "Passed", machineResult: "Unresolved" }), // AI-resolved
];

describe("machineResults", () => {
  it("returns only machine-decided rows with passed/failed counts", () => {
    const m = machineResults(rows);
    expect(m.passed).toBe(1);
    expect(m.failed).toBe(1);
    expect(m.rows.map((r) => r.num)).toEqual(["1.1.1", "1.4.3"]);
  });
});

describe("aiResults", () => {
  it("counts AI verdicts by outcome", () => {
    const ai = {
      model: "m",
      verdicts: [
        { sc: "1.2.1", verdict: "Passed" as const, confidence: 0.9, reasoning: "r" },
        { sc: "2.4.7", verdict: "CannotTell" as const, confidence: 0.4, reasoning: "r" },
      ],
      budget: { calls: 2, images: 2 },
    };
    const a = aiResults(ai);
    expect(a).not.toBeNull();
    expect(a?.passed).toBe(1);
    expect(a?.cannotTell).toBe(1);
    expect(a?.verdicts).toHaveLength(2);
  });

  it("returns null when no AI review ran", () => {
    expect(aiResults(undefined)).toBeNull();
  });
});

describe("humanReviewPending", () => {
  it("returns the CannotTell rows that still need human judgement", () => {
    const h = humanReviewPending(rows);
    expect(h.count).toBe(1);
    expect(h.rows[0]?.num).toBe("2.4.7");
  });
});

describe("combinedSummary", () => {
  it("passes through the combined outcome and counts", () => {
    const conformance = {
      total: 4, passed: 2, failed: 1, notPresent: 0, cannotTell: 1,
      coverage: 75, levelAttained: "AA", outcome: "does-not-conform",
      scsMet: 2, scsApplicable: 3, rows,
    } as Conformance;
    const c = combinedSummary(conformance);
    expect(c.outcome).toBe("does-not-conform");
    expect(c.passed).toBe(2);
    expect(c.cannotTell).toBe(1);
    expect(c.coverage).toBe(75);
  });
});
