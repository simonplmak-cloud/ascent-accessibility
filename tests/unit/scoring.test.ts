import { describe, expect, it } from "vitest";
import { computeScore, type Impact } from "@/lib/scoring";

const f = (impact: Impact) => ({ impact });
const findings = (...impacts: Impact[]) => impacts.map(f);

describe("ScoringService", () => {
  it("scores a clean site as 100 / pass", () => {
    expect(computeScore([])).toEqual({ score: 100, passBand: "pass" });
  });

  it("applies the severity weights (AC-5)", () => {
    expect(computeScore(findings("minor")).score).toBe(99);
    expect(computeScore(findings("moderate")).score).toBe(98);
    expect(computeScore(findings("serious")).score).toBe(95);
    expect(computeScore(findings("critical")).score).toBe(90);
  });

  it("accumulates fractional minor weights deterministically", () => {
    expect(computeScore(findings("minor", "minor")).score).toBe(99);
    expect(computeScore(findings("minor", "minor", "minor")).score).toBe(98);
  });

  it("computes the pass-band thresholds", () => {
    expect(computeScore(findings("critical")).passBand).toBe("pass"); // 90
    expect(computeScore(findings("critical", "moderate")).passBand).toBe("partial"); // 88
    expect(
      computeScore(findings("critical", "critical", "critical")).passBand,
    ).toBe("partial"); // 70
    expect(
      computeScore(findings("critical", "critical", "critical", "moderate")).passBand,
    ).toBe("fail"); // 68
  });

  it("clamps scores at 0", () => {
    const many = Array.from({ length: 20 }, () => f("critical"));
    expect(computeScore(many)).toEqual({ score: 0, passBand: "fail" });
  });

  it("is deterministic and order-independent (AC-8)", () => {
    const a = computeScore(findings("critical", "serious", "minor"));
    const b = computeScore(findings("minor", "critical", "serious"));
    expect(a).toEqual(b);
    expect(computeScore(findings("serious", "serious"))).toEqual(
      computeScore(findings("serious", "serious")),
    );
  });
});
