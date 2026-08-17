import { describe, expect, it } from "vitest";
import { computeParity } from "../differential/parity";

describe("computeParity", () => {
  it("reports 100% agreement when engine and oracle match", () => {
    const engine = [
      { sc: "1.1.1", result: "fail" as const },
      { sc: "3.1.1", result: "pass" as const },
    ];
    const oracle = [
      { sc: "1.1.1", result: "fail" as const },
      { sc: "3.1.1", result: "pass" as const },
    ];
    expect(computeParity(engine, oracle)).toMatchObject({ total: 2, agreed: 2, agreementPct: 100 });
  });

  it("flags disagreements with their SC", () => {
    const engine = [{ sc: "1.1.1", result: "fail" as const }];
    const oracle = [{ sc: "1.1.1", result: "pass" as const }];
    const report = computeParity(engine, oracle);
    expect(report.agreementPct).toBe(0);
    expect(report.disagreements).toEqual([{ sc: "1.1.1", engine: "fail", oracle: "pass" }]);
  });

  it("ignores SCs the oracle did not test", () => {
    const engine = [{ sc: "1.1.1", result: "fail" as const }];
    expect(computeParity(engine, [])).toMatchObject({ total: 0, agreementPct: 100 });
  });
});
