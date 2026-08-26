import { describe, expect, it } from "vitest";
import {
  computeAiParity,
  runAiParityEval,
  type AiParityReport,
  type LabeledVerdict,
} from "../differential/ai-parity";
import type { ScAiConfig } from "@/lib/ai-review/sc-config";

function cfg(sc: string, overrides: Partial<ScAiConfig> = {}): ScAiConfig {
  return {
    sc,
    instructionId: `${sc}.1`,
    modality: "vision",
    judgeable: true,
    instruction: "instruction",
    whatToLookFor: [],
    passRequires: [],
    failRequires: [],
    ruleId: `ai-${sc}`,
    description: `${sc} description`,
    recommendation: `${sc} recommendation`,
    help: `${sc} help`,
    source: "test",
    notes: "test",
    enabled: true,
    ...overrides,
  };
}

const v = (sc: string, verdict: LabeledVerdict["verdict"]): LabeledVerdict => ({ sc, verdict });

function metricsFor(report: AiParityReport, sc: string) {
  return report.perSc.find((m) => m.sc === sc);
}

describe("computeAiParity (AC-19 / AC-E6 gate)", () => {
  it("reports full precision/recall and passes the gate on perfect agreement", () => {
    const report = computeAiParity(
      [v("1.3.3", "fail"), v("1.3.3", "pass")],
      [v("1.3.3", "fail"), v("1.3.3", "pass")],
    );
    const m = metricsFor(report, "1.3.3")!;
    expect(m).toMatchObject({
      precision: 1,
      recall: 1,
      falsePassRate: 0,
      falseNeedsReviewRate: 0,
      gatePassed: true,
    });
    expect(report.gatePassed).toBe(true);
  });

  it("fails the gate on a false pass (oracle fail, AI pass)", () => {
    const report = computeAiParity([v("1.3.3", "pass")], [v("1.3.3", "fail")]);
    const m = metricsFor(report, "1.3.3")!;
    expect(m.falsePass).toBe(1);
    expect(m.recall).toBe(0);
    expect(m.gatePassed).toBe(false);
    expect(m.gateFailures.join(" ")).toContain("false-pass");
    expect(report.failures).toEqual(["1.3.3"]);
  });

  it("fails the gate when false-needs-review exceeds 0.4", () => {
    const ai = [v("1.4.5", "needs-review"), v("1.4.5", "needs-review"), v("1.4.5", "pass")];
    const oracle = [v("1.4.5", "pass"), v("1.4.5", "fail"), v("1.4.5", "pass")];
    const report = computeAiParity(ai, oracle);
    const m = metricsFor(report, "1.4.5")!;
    expect(m.falseNeedsReviewRate).toBeCloseTo(2 / 3);
    expect(m.gatePassed).toBe(false);
    expect(m.gateFailures.join(" ")).toContain("false-needs-review");
  });

  it("fails the gate when precision drops below 0.8 (AI fail on oracle pass)", () => {
    const report = computeAiParity(
      [v("1.4.5", "fail"), v("1.4.5", "fail")],
      [v("1.4.5", "pass"), v("1.4.5", "pass")],
    );
    const m = metricsFor(report, "1.4.5")!;
    expect(m.precision).toBe(0);
    expect(m.gatePassed).toBe(false);
    expect(m.gateFailures.join(" ")).toContain("precision");
  });

  it("isolates per-SC gate results and reports only the failing rule", () => {
    const report = computeAiParity(
      [v("1.3.3", "fail"), v("1.4.5", "pass")],
      [v("1.3.3", "fail"), v("1.4.5", "fail")],
    );
    expect(metricsFor(report, "1.3.3")!.gatePassed).toBe(true);
    expect(metricsFor(report, "1.4.5")!.gatePassed).toBe(false);
    expect(report.gatePassed).toBe(false);
    expect(report.failures).toEqual(["1.4.5"]);
  });

  it("passes the gate on an empty set", () => {
    const report = computeAiParity([], []);
    expect(report.perSc).toHaveLength(0);
    expect(report.gatePassed).toBe(true);
  });
});

describe("runAiParityEval (harness)", () => {
  it("maps triage verdicts to parity verdicts and reports the gate", async () => {
    const model = {
      review: async () => [{ sc: "1.3.3", verdict: "Failed" as const, confidence: 0.9, reasoning: "r" }],
    };
    const report = await runAiParityEval({
      model,
      images: [{ id: "p1", image: Buffer.alloc(0), labels: [{ sc: "1.3.3", oracle: "fail" }] }],
      getConfig: async (sc: string) => cfg(sc),
    });
    const m = metricsFor(report, "1.3.3")!;
    expect(m.tp).toBe(1);
    expect(m.gatePassed).toBe(true);
    expect(report.gatePassed).toBe(true);
  });

  it("reports a false pass when the model passes an oracle fail", async () => {
    const model = {
      review: async () => [{ sc: "1.4.5", verdict: "Passed" as const, confidence: 0.9, reasoning: "r" }],
    };
    const report = await runAiParityEval({
      model,
      images: [{ id: "p1", image: Buffer.alloc(0), labels: [{ sc: "1.4.5", oracle: "fail" }] }],
      getConfig: async (sc: string) => cfg(sc),
    });
    expect(report.gatePassed).toBe(false);
    expect(report.failures).toEqual(["1.4.5"]);
  });
});
