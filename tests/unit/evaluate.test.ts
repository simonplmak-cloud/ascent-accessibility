import { describe, expect, it, vi } from "vitest";
import { evaluateStandard } from "@/lib/assessment/evaluate";
import { EMPTY_FEATURES, type PageFeatures } from "@/lib/standards/sc-applicability";
import type { VisionModel, AiReview } from "@/lib/ai-review/types";
import type { ScAiConfig } from "@/lib/ai-review/sc-config";
import type { Finding } from "@/db/schema";

const FEATURES: PageFeatures = {
  ...EMPTY_FEATURES,
  hasContent: true,
  hasImages: true,
  hasLinks: true,
  hasInteractive: true,
  hasHeadings: true,
  hasLang: true,
  hasForms: true,
};

function finding(wcagSc: string[]): Finding {
  return {
    ruleId: "x",
    impact: "serious",
    description: "d",
    pageUrl: "p",
    elementCount: 1,
    recommendation: "r",
    help: "",
    helpUrl: "",
    wcagSc,
    wcagLevel: null,
    scTitle: "",
    confidence: "single-source",
    sources: [],
    instances: [],
  };
}

const input = {
  version: "2.2",
  level: "AA" as const,
  findings: [] as Finding[],
  passedScs: new Set<string>(),
  matchedScs: new Set<string>(["2.4.4", "3.3.7"]),
  features: FEATURES,
  pageUrl: "https://x.example/",
};

function model(reviews: AiReview[]): VisionModel {
  return { review: vi.fn(async () => reviews) };
}

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

// Only the SCs listed in `map` are judgeable; everything else is needs-review.
const getConfig = (map: Record<string, ScAiConfig>) => async (sc: string) =>
  map[sc] ?? cfg(sc, { judgeable: false });

describe("evaluateStandard", () => {
  it("resolves machine verdicts and never dispatches resolved SCs to AI (AC-E2)", async () => {
    const prompts: string[] = [];
    const m: VisionModel = { review: vi.fn(async (i) => { prompts.push(i.prompt); return []; }) };
    const out = await evaluateStandard(
      { ...input, findings: [finding(["1.4.3"])], passedScs: new Set(["1.1.1"]) },
      {
        visionModel: m,
        aiScreenshot: Buffer.alloc(0),
        getConfig: getConfig({ "2.4.4": cfg("2.4.4") }),
      },
    );
    expect(out.conformance.rows.find((r) => r.num === "1.4.3")?.result).toBe("Failed");
    expect(out.conformance.rows.find((r) => r.num === "1.1.1")?.result).toBe("Passed");
    const all = prompts.join("\n");
    expect(all).not.toContain("WCAG 1.4.3");
    expect(all).not.toContain("WCAG 1.1.1");
    expect(all).toContain("WCAG 2.4.4");
  });

  it("dispatches AI for a judgeable unresolved SC and folds Passed (AC-6, AC-12)", async () => {
    const m = model([{ sc: "1.3.2", verdict: "Passed", confidence: 0.9, reasoning: "r" }]);
    const out = await evaluateStandard(
      input,
      {
        visionModel: m,
        aiScreenshot: Buffer.alloc(0),
        getConfig: getConfig({ "1.3.2": cfg("1.3.2") }),
      },
    );
    expect(m.review).toHaveBeenCalled();
    expect(out.conformance.rows.find((r) => r.num === "1.3.2")?.result).toBe("Passed");
  });

  it("keeps a low-confidence AI verdict as a single-source Passed (AC-8)", async () => {
    const m = model([{ sc: "1.3.2", verdict: "Passed", confidence: 0.5, reasoning: "r" }]);
    const out = await evaluateStandard(
      input,
      {
        visionModel: m,
        aiScreenshot: Buffer.alloc(0),
        getConfig: getConfig({ "1.3.2": cfg("1.3.2") }),
      },
    );
    expect(out.conformance.rows.find((r) => r.num === "1.3.2")?.result).toBe("Passed");
  });

  it("never dispatches manual-only SCs to AI (AC-7)", async () => {
    const prompts: string[] = [];
    const m: VisionModel = { review: vi.fn(async (i) => { prompts.push(i.prompt); return []; }) };
    const out = await evaluateStandard(
      input,
      {
        visionModel: m,
        aiScreenshot: Buffer.alloc(0),
        getConfig: getConfig({ "2.4.4": cfg("2.4.4") }),
      },
    );
    // 3.3.4 (error prevention, legal/financial/data) is manual-only + applicable (hasForms)
    // -> excluded from the AI prompt, ends CannotTell.
    expect(prompts.join("\n")).not.toContain("WCAG 3.3.4");
    expect(out.conformance.rows.find((r) => r.num === "3.3.4")?.result).toBe("CannotTell");
  });

  it("never dispatches machine-testable (non-ai) SCs to AI", async () => {
    const prompts: string[] = [];
    const m: VisionModel = { review: vi.fn(async (i) => { prompts.push(i.prompt); return []; }) };
    await evaluateStandard(
      input,
      {
        visionModel: m,
        aiScreenshot: Buffer.alloc(0),
        getConfig: getConfig({ "2.4.4": cfg("2.4.4") }),
      },
    );
    // 3.3.7 (redundant-entry) is machine-testable + applicable (hasForms) but
    // unresolved -> must NOT be sent to the AI (stays engine-rule-pending).
    expect(prompts.join("\n")).not.toContain("WCAG 3.3.7");
    expect(prompts.join("\n")).toContain("WCAG 2.4.4");
  });

  it("skips AI when no vision model is provided (AC-6)", async () => {
    const out = await evaluateStandard(input, { aiScreenshot: Buffer.alloc(0) });
    expect(out.conformance.rows.find((r) => r.num === "1.3.2")?.result).toBe("CannotTell");
  });
});
