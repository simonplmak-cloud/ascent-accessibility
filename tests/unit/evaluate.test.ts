import { describe, expect, it, vi } from "vitest";
import { evaluateStandard } from "@/lib/assessment/evaluate";
import { EMPTY_FEATURES, type PageFeatures } from "@/lib/standards/sc-applicability";
import type { VisionModel, AiReview } from "@/lib/ai-review/types";
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
  features: FEATURES,
  pageUrl: "https://x.example/",
};

function model(reviews: AiReview[]): VisionModel {
  return { review: vi.fn(async () => reviews) };
}

describe("evaluateStandard", () => {
  it("resolves machine verdicts and never dispatches resolved SCs to AI (AC-E2)", async () => {
    let prompt = "";
    const m: VisionModel = { review: vi.fn(async (i) => { prompt = i.prompt; return []; }) };
    const out = await evaluateStandard(
      { ...input, findings: [finding(["1.4.3"])], passedScs: new Set(["1.1.1"]) },
      { visionModel: m, aiScreenshot: Buffer.alloc(0), aiEnabled: true },
    );
    expect(out.conformance.rows.find((r) => r.num === "1.4.3")?.result).toBe("Failed");
    expect(out.conformance.rows.find((r) => r.num === "1.1.1")?.result).toBe("Passed");
    expect(prompt).not.toContain("- 1.4.3 ");
    expect(prompt).not.toContain("- 1.1.1 ");
  });

  it("dispatches AI for unresolved non-manual SCs and folds Passed (AC-6, AC-12)", async () => {
    const m = model([{ sc: "1.3.2", verdict: "Passed", confidence: 0.9, reasoning: "r" }]);
    const out = await evaluateStandard(
      input,
      { visionModel: m, aiScreenshot: Buffer.alloc(0), aiEnabled: true },
    );
    expect(m.review).toHaveBeenCalled();
    expect(out.conformance.rows.find((r) => r.num === "1.3.2")?.result).toBe("Passed");
  });

  it("leaves AI-uncertain verdicts as CannotTell (AC-8)", async () => {
    const m = model([{ sc: "1.3.2", verdict: "Passed", confidence: 0.5, reasoning: "r" }]);
    const out = await evaluateStandard(
      input,
      { visionModel: m, aiScreenshot: Buffer.alloc(0), aiEnabled: true },
    );
    expect(out.conformance.rows.find((r) => r.num === "1.3.2")?.result).toBe("CannotTell");
  });

  it("never dispatches manual-only SCs to AI (AC-7)", async () => {
    let prompt = "";
    const m: VisionModel = { review: vi.fn(async (i) => { prompt = i.prompt; return []; }) };
    const out = await evaluateStandard(
      input,
      { visionModel: m, aiScreenshot: Buffer.alloc(0), aiEnabled: true },
    );
    // 3.3.4 (error prevention, legal/financial/data) is manual-only + applicable (hasForms)
    // -> excluded from the AI prompt, ends CannotTell.
    expect(prompt).not.toContain("- 3.3.4 ");
    expect(out.conformance.rows.find((r) => r.num === "3.3.4")?.result).toBe("CannotTell");
  });

  it("skips AI when disabled (AC-6)", async () => {
    const out = await evaluateStandard(input, { aiEnabled: false });
    expect(out.conformance.rows.find((r) => r.num === "1.3.2")?.result).toBe("CannotTell");
  });
});
