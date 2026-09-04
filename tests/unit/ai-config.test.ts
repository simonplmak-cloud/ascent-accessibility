import { describe, expect, it } from "vitest";
import { instructionsOf } from "@/lib/standards/nature";
import { WCAG_SCS } from "@/lib/standards/wcag-sc";
import { DEFAULT_AI_CONFIGS } from "@/lib/ai-review/sc-config";
import { judgeableFromScreenshot } from "@/lib/ai-review/testability";
import { DEFAULT_AI_SETTINGS, resolveSettings } from "@/lib/ai-review/settings";

function aiDetectableScs(): string[] {
  return WCAG_SCS.map((s) => s.num).filter((sc) =>
    instructionsOf(sc).some((i) => i.nature === "ai-detectable"),
  );
}

describe("DEFAULT_AI_CONFIGS", () => {
  it("covers every ai-detectable SC (and the agentic formerly-manual SCs) (AC-1)", () => {
    const expected = aiDetectableScs().sort();
    const actual = Object.keys(DEFAULT_AI_CONFIGS).sort();
    for (const sc of expected) expect(actual).toContain(sc);
  });

  it("every config carries identity + prompt + output + provenance (AC-2, AC-16)", () => {
    for (const [sc, c] of Object.entries(DEFAULT_AI_CONFIGS)) {
      expect(c.sc).toBe(sc);
      expect(c.instructionId).toBeTruthy();
      expect(["vision", "audio"]).toContain(c.modality);
      expect(typeof c.judgeable).toBe("boolean");
      expect(c.instruction).toBeTruthy();
      expect(Array.isArray(c.whatToLookFor)).toBe(true);
      expect(Array.isArray(c.passRequires)).toBe(true);
      expect(Array.isArray(c.failRequires)).toBe(true);
      expect(c.ruleId).toBeTruthy();
      expect(c.description).toBeTruthy();
      expect(c.recommendation).toBeTruthy();
      expect(c.help).toBeTruthy();
      expect(c.source).toContain("Understanding");
      expect(c.notes).toBeTruthy();
      expect(c.enabled).toBe(true);
    }
  });

  it("judgeable derives from the testability matrix (AC-17)", () => {
    for (const [sc, c] of Object.entries(DEFAULT_AI_CONFIGS)) {
      if (c.modality === "vision") {
        expect(c.judgeable).toBe(judgeableFromScreenshot(sc));
      }
    }
  });

  it("every config carries evidence lists (screenshot or browser tools)", () => {
    for (const c of Object.values(DEFAULT_AI_CONFIGS)) {
      expect(c.whatToLookFor.length).toBeGreaterThan(0);
      expect(c.passRequires.length).toBeGreaterThan(0);
      expect(c.failRequires.length).toBeGreaterThan(0);
    }
  });

  it("audio SCs are all judgeable (from media)", () => {
    for (const c of Object.values(DEFAULT_AI_CONFIGS)) {
      if (c.modality === "audio") expect(c.judgeable).toBe(true);
    }
  });
});

describe("settings", () => {
  it("resolveSettings merges per-criterion overrides (AC-12)", () => {
    expect(resolveSettings()).toEqual(DEFAULT_AI_SETTINGS);
    expect(resolveSettings({ temperature: 0.3 }).temperature).toBe(0.3);
    expect(resolveSettings({ temperature: 0.3 }).maxTokens).toBe(2048);
  });

  it("defaults are deterministic (AC-11)", () => {
    expect(DEFAULT_AI_SETTINGS.temperature).toBe(0);
    expect(DEFAULT_AI_SETTINGS.topP).toBe(1);
    expect(DEFAULT_AI_SETTINGS.maxTokens).toBe(2048);
    expect(DEFAULT_AI_SETTINGS.seed).toBe(42);
    expect(DEFAULT_AI_SETTINGS.confidenceThreshold).toBe(0.8);
  });
});
