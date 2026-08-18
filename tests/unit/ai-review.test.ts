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

const model = (reviews: AiReview[]): VisionModel => ({
  review: async () => reviews,
});

describe("resolveVerdict (fail-safe)", () => {
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

  it("degrades a below-threshold verdict to CannotTell", () => {
    expect(
      resolveVerdict("1.1.1", [{ sc: "1.1.1", verdict: "Passed", confidence: 0.5, reasoning: "r" }]),
    ).toMatchObject({ verdict: "CannotTell" });
  });

  it("keeps an explicit CannotTell as CannotTell regardless of confidence", () => {
    expect(
      resolveVerdict("1.1.1", [{ sc: "1.1.1", verdict: "CannotTell", confidence: 0.99, reasoning: "r" }]),
    ).toMatchObject({ verdict: "CannotTell" });
  });

  it("defaults to CannotTell when no verdict is returned", () => {
    expect(resolveVerdict("1.1.1", [])).toMatchObject({ verdict: "CannotTell" });
  });
});

describe("runTriage", () => {
  it("returns all-CannotTell when the model errors (AC-E3)", async () => {
    const failing: VisionModel = { review: async () => Promise.reject(new Error("boom")) };
    const result = await runTriage({
      model: failing,
      image: Buffer.alloc(0),
      unresolvedScs: ["1.1.1", "2.4.4"],
    });
    expect(result.reviews.map((r) => r.verdict)).toEqual(["CannotTell", "CannotTell"]);
  });

  it("applies the confidence threshold across every unresolved SC", async () => {
    const result = await runTriage({
      model: model([
        { sc: "1.1.1", verdict: "Passed", confidence: 0.9, reasoning: "r" },
        { sc: "2.4.4", verdict: "Failed", confidence: 0.5, reasoning: "r" },
      ]),
      image: Buffer.alloc(0),
      unresolvedScs: ["1.1.1", "2.4.4", "3.1.1"],
    });
    expect(result.reviews).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sc: "1.1.1", verdict: "Passed" }),
        expect.objectContaining({ sc: "2.4.4", verdict: "CannotTell" }),
        expect.objectContaining({ sc: "3.1.1", verdict: "CannotTell" }),
      ]),
    );
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
  it("promotes ai-Passed into passedScs and ai-Failed into a finding, leaves CannotTell alone", () => {
    const verdicts: AiReview[] = [
      { sc: "1.1.1", verdict: "Passed", confidence: 0.9, reasoning: "r" },
      { sc: "2.4.4", verdict: "Failed", confidence: 0.9, reasoning: "unclear links" },
      { sc: "3.1.1", verdict: "CannotTell", confidence: 0.5, reasoning: "r" },
    ];
    const result = applyAiVerdicts([], new Set(["9.9.9"]), verdicts, "https://example.com/");
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

describe("aiFailToFinding", () => {
  it("maps level A to serious and tags the source as ai (AC-7)", () => {
    const finding = aiFailToFinding(
      { sc: "1.1.1", verdict: "Failed", confidence: 0.9, reasoning: "meaningless alt" },
      "https://example.com/",
    );
    expect(finding.impact).toBe("serious");
    expect(finding.wcagSc).toEqual(["1.1.1"]);
    expect(finding.sources[0]?.tool).toBe("ai");
    expect(finding.confidence).toBe("single-source");
  });
});
