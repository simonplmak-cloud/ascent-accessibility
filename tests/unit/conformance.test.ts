import { describe, expect, it } from "vitest";
import { computeConformance, computeScore } from "@/lib/scoring";

describe("computeScore", () => {
  it("weights findings by impact and instance frequency (capped)", () => {
    expect(computeScore([{ impact: "critical", elementCount: 1 }]).score).toBe(90);
    expect(computeScore([{ impact: "critical", elementCount: 3 }]).score).toBe(70);
    expect(computeScore([{ impact: "critical", elementCount: 20 }]).score).toBe(0);
  });
});

describe("computeConformance", () => {
  it("marks failing, passing, and untested SCs", () => {
    const result = computeConformance(
      [{ wcagSc: ["1.4.3"] }],
      new Set(["1.4.3", "1.1.1"]),
      "AA",
    );
    expect(result.rows.find((r) => r.num === "1.4.3")?.result).toBe("fail");
    expect(result.rows.find((r) => r.num === "1.1.1")?.result).toBe("pass");
    expect(result.failed).toBe(1);
  });

  it("marks SCs with no coverage as not-tested", () => {
    const result = computeConformance([{ wcagSc: ["1.4.3"] }], new Set(["1.4.3"]), "AA");
    expect(result.rows.find((r) => r.num === "1.1.1")?.result).toBe("not-tested");
  });
});
