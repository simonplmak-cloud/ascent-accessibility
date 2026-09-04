import { describe, expect, it } from "vitest";
import { aiResults, combinedSummary, notTestedRows, machineResults } from "@/lib/report/report-methods";
import type { AiVerdict, MethodRow } from "@/lib/report/report-methods";

const rows: MethodRow[] = [
  { num: "1.1.1", title: "Non-text Content", level: "A", result: "Failed", machineResult: "Failed" },
  { num: "1.4.3", title: "Contrast (Minimum)", level: "AA", result: "Passed", machineResult: "Passed" },
  { num: "2.4.7", title: "Focus Visible", level: "AA", result: "NotTested", machineResult: "Unresolved" },
  { num: "1.2.1", title: "Audio-only", level: "A", result: "NotPresent", machineResult: "NotPresent" },
];

const verdicts: AiVerdict[] = [
  { sc: "2.4.7", verdict: "Passed", confidence: 0.9, reasoning: "Focus outline visible." },
  { sc: "1.2.2", verdict: "NotTested", confidence: 0.5, reasoning: "No media to judge." },
  { sc: "1.3.1", verdict: "Failed", confidence: 0.85, reasoning: "Heading levels skipped." },
];

describe("machineResults", () => {
  it("returns only substantive machine verdicts (Passed/Failed), with counts", () => {
    const m = machineResults(rows);
    expect(m.passed).toBe(1);
    expect(m.failed).toBe(1);
    expect(m.rows.map((r) => r.num)).toEqual(["1.1.1", "1.4.3"]);
  });

  it("excludes Unresolved and NotPresent", () => {
    const m = machineResults(rows);
    expect(m.rows.map((r) => r.num)).not.toContain("2.4.7");
    expect(m.rows.map((r) => r.num)).not.toContain("1.2.1");
  });
});

describe("aiResults", () => {
  it("counts AI verdicts by outcome and keeps the verdicts", () => {
    const a = aiResults(verdicts);
    expect(a.passed).toBe(1);
    expect(a.failed).toBe(1);
    expect(a.notTested).toBe(1);
    expect(a.verdicts).toHaveLength(3);
  });
});

describe("notTestedRows", () => {
  it("returns the CannotTell rows needing human judgement", () => {
    const h = notTestedRows(rows);
    expect(h.count).toBe(1);
    expect(h.rows[0]?.num).toBe("2.4.7");
  });
});

describe("combinedSummary", () => {
  it("returns the combined aggregates unchanged", () => {
    const c = {
      total: 4, passed: 1, failed: 1, notPresent: 1, notTested: 1,
      coverage: 75, levelAttained: "A", outcome: "does-not-conform",
    };
    expect(combinedSummary(c)).toEqual(c);
  });
});
