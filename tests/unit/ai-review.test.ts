import { describe, expect, it } from "vitest";
import {
  AI_CONFIDENCE_THRESHOLD,
  aiFailToFinding,
  applyAiVerdicts,
  impactForScLevel,
  resolveVerdict,
  runTriage,
} from "@/lib/ai-review/triage";
import type { AiReview, VisionModel } from "@/lib/ai-review/types";
import type { ScAiConfig } from "@/lib/ai-review/sc-config";

const model = (reviews: AiReview[]): VisionModel => ({
  review: async () => reviews,
});

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

const getConfig =
  (map: Record<string, ScAiConfig>) =>
  async (sc: string): Promise<ScAiConfig> =>
    map[sc] ?? cfg(sc, { judgeable: false });

describe("resolveVerdict (always-emit)", () => {
  it("promotes a high-confidence pass", () => {
    expect(
      resolveVerdict("1.1.1", [{ sc: "1.1.1", verdict: "Passed", confidence: 0.9, reasoning: "r" }]),
    ).toMatchObject({ verdict: "Passed" });
  });

  it("promotes a high-confidence fail", () => {
    expect(
      resolveVerdict("1.1.1", [{ sc: "1.1.1", verdict: "Failed", confidence: 0.85, reasoning: "r" }]),
    ).toMatchObject({ verdict: "Failed" });
  });

  it("keeps a below-threshold verdict as-is (single-source, never CannotTell)", () => {
    expect(
      resolveVerdict("1.1.1", [{ sc: "1.1.1", verdict: "Passed", confidence: 0.5, reasoning: "r" }]),
    ).toMatchObject({ verdict: "Passed" });
  });

  it("leans a model 'CannotTell' toward the more likely outcome", () => {
    expect(
      resolveVerdict("1.1.1", [{ sc: "1.1.1", verdict: "CannotTell", confidence: 0.99, reasoning: "r" }]),
    ).toMatchObject({ verdict: "Passed" });
    expect(
      resolveVerdict("1.1.1", [{ sc: "1.1.1", verdict: "CannotTell", confidence: 0.1, reasoning: "r" }]),
    ).toMatchObject({ verdict: "Failed" });
  });

  it("defaults to Failed when no verdict is returned", () => {
    expect(resolveVerdict("1.1.1", [])).toMatchObject({ verdict: "Failed" });
  });
});

describe("runTriage (one call per judgeable criterion)", () => {
  it("calls once per judgeable criterion and skips non-judgeable ones (AC-7/AC-8)", async () => {
    let calls = 0;
    const spy: VisionModel = {
      review: async () => {
        calls += 1;
        return [{ sc: "2.4.4", verdict: "Passed", confidence: 0.9, reasoning: "r" }];
      },
    };
    const result = await runTriage({
      model: spy,
      image: Buffer.alloc(0),
      unresolvedScs: ["2.4.4", "1.3.2"],
      getConfig: getConfig({ "2.4.4": cfg("2.4.4"), "1.3.2": cfg("1.3.2", { judgeable: false }) }),
    });
    expect(calls).toBe(1);
    expect(result.budget).toEqual({ calls: 1, images: 1 });
    expect(result.reviews).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sc: "2.4.4", verdict: "Passed" }),
        expect.objectContaining({ sc: "1.3.2", verdict: "CannotTell" }),
      ]),
    );
  });

  it("skips a disabled criterion with no call", async () => {
    let calls = 0;
    const spy: VisionModel = {
      review: async () => {
        calls += 1;
        return [];
      },
    };
    const result = await runTriage({
      model: spy,
      image: Buffer.alloc(0),
      unresolvedScs: ["2.4.4"],
      getConfig: getConfig({ "2.4.4": cfg("2.4.4", { enabled: false }) }),
    });
    expect(calls).toBe(0);
    expect(result.reviews[0]).toMatchObject({ sc: "2.4.4", verdict: "CannotTell" });
  });

  it("retries once on model error, then fails safe to CannotTell (AC-14/AC-E3)", async () => {
    let attempts = 0;
    const flaky: VisionModel = {
      review: async () => {
        attempts += 1;
        throw new Error("boom");
      },
    };
    const result = await runTriage({
      model: flaky,
      image: Buffer.alloc(0),
      unresolvedScs: ["2.4.4"],
      getConfig: getConfig({ "2.4.4": cfg("2.4.4") }),
    });
    expect(attempts).toBe(2);
    expect(result.reviews[0]).toMatchObject({ sc: "2.4.4", verdict: "CannotTell" });
  });

  it("degrades a below-threshold pass to a single-source Passed (never CannotTell)", async () => {
    const result = await runTriage({
      model: model([{ sc: "2.4.4", verdict: "Passed", confidence: 0.5, reasoning: "r" }]),
      image: Buffer.alloc(0),
      unresolvedScs: ["2.4.4"],
      getConfig: getConfig({ "2.4.4": cfg("2.4.4") }),
    });
    expect(result.reviews[0]).toMatchObject({ verdict: "Passed" });
  });

  it("short-circuits with no call when there is nothing to review", async () => {
    let called = false;
    const spy: VisionModel = {
      review: async () => {
        called = true;
        return [];
      },
    };
    const result = await runTriage({ model: spy, image: Buffer.alloc(0), unresolvedScs: [] });
    expect(result.budget).toEqual({ calls: 0, images: 0 });
    expect(called).toBe(false);
  });
});

describe("impactForScLevel", () => {
  it("maps A -> serious, AA -> moderate, AAA -> minor", () => {
    expect(impactForScLevel("1.1.1")).toBe("serious");
    expect(impactForScLevel("1.4.4")).toBe("moderate");
    expect(impactForScLevel("1.2.8")).toBe("minor");
  });
});

describe("AI_CONFIDENCE_THRESHOLD", () => {
  it("is 0.8", () => {
    expect(AI_CONFIDENCE_THRESHOLD).toBe(0.8);
  });
});

describe("applyAiVerdicts", () => {
  it("promotes ai-Passed into passedScs and ai-Failed into a finding, leaves CannotTell alone", async () => {
    const verdicts: AiReview[] = [
      { sc: "1.1.1", verdict: "Passed", confidence: 0.9, reasoning: "r" },
      { sc: "2.4.4", verdict: "Failed", confidence: 0.9, reasoning: "unclear links" },
      { sc: "3.1.1", verdict: "CannotTell", confidence: 0.5, reasoning: "r" },
    ];
    const result = await applyAiVerdicts(
      [],
      new Set(["9.9.9"]),
      verdicts,
      "https://example.com/",
      getConfig({ "2.4.4": cfg("2.4.4") }),
    );
    expect(result.passedScs.has("1.1.1")).toBe(true);
    expect(result.passedScs.has("9.9.9")).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      wcagSc: ["2.4.4"],
      impact: "serious",
      sources: [{ tool: "ai" }],
    });
  });
});

describe("aiFailToFinding (output parity)", () => {
  it("uses config output fields and preserves reasoning as evidence (AC-15)", () => {
    const finding = aiFailToFinding(
      cfg("2.4.4", {
        ruleId: "ai-link-purpose-context",
        description: "A link's purpose is not clear from its context",
        recommendation: "Clarify the link text.",
        help: "Link purpose must be clear in context",
      }),
      { sc: "2.4.4", verdict: "Failed", confidence: 0.9, reasoning: "three ambiguous links" },
      "https://example.com/",
    );
    expect(finding).toMatchObject({
      ruleId: "ai-link-purpose-context",
      impact: "serious",
      description: "A link's purpose is not clear from its context",
      recommendation: "Clarify the link text.",
      help: "Link purpose must be clear in context",
      wcagSc: ["2.4.4"],
      confidence: "single-source",
    });
    expect(finding.instances[0]?.failureSummary).toBe("three ambiguous links");
    expect(finding.sources[0]?.message).toBe("three ambiguous links");
    expect(finding.sources[0]?.tool).toBe("ai");
  });
});
