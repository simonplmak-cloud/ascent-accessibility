import { describe, expect, it } from "vitest";
import { assessRequestSchema } from "@/server/validation";
import { buildScPrompt, buildTriageSystemPrompt } from "@/lib/ai-review/prompt";
import type { ScAiConfig } from "@/lib/ai-review/sc-config";

const config: ScAiConfig = {
  sc: "1.1.1",
  instructionId: "i1",
  modality: "vision",
  judgeable: true,
  enabled: true,
  instruction: "images have meaningful text alternatives",
  whatToLookFor: [],
  passRequires: [],
  failRequires: [],
  examples: {},
  ruleId: "ai-1.1.1",
  description: "desc",
  recommendation: "rec",
  help: "help",
  settings: {},
  source: "Understanding 1.1.1",
  notes: "",
};

describe("assessment locale", () => {
  it("defaults a missing locale to en", () => {
    const parsed = assessRequestSchema.safeParse({ url: "https://example.com" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.locale).toBe("en");
  });

  it("accepts a valid locale", () => {
    const parsed = assessRequestSchema.safeParse({ url: "https://example.com", locale: "zh-Hant" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.locale).toBe("zh-Hant");
  });
});

describe("ai-review prompt locale", () => {
  it("requests Traditional Chinese reasoning when locale is zh-Hant", () => {
    const system = buildTriageSystemPrompt("zh-Hant");
    expect(system).toContain("Traditional Chinese");
    const sc = buildScPrompt(config, "zh-Hant");
    expect(sc).toContain("Traditional Chinese");
  });

  it("is English-only when locale is en/absent", () => {
    expect(buildTriageSystemPrompt()).not.toContain("Chinese");
    expect(buildScPrompt(config)).not.toContain("Chinese");
  });
});
