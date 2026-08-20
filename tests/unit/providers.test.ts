import { describe, expect, it } from "vitest";
import {
  AI_PROVIDERS,
  DEFAULT_VISION_MODEL,
  getProvider,
} from "@/lib/ai-review/providers";
import { parseVerdicts } from "@/lib/ai-review/parse";

describe("AI_PROVIDERS catalog", () => {
  it("includes the six providers", () => {
    const ids = AI_PROVIDERS.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining(["openrouter", "openai", "dashscope", "gemini", "anthropic", "custom"]),
    );
  });

  it("defaults to a Qwen vision model", () => {
    expect(DEFAULT_VISION_MODEL.toLowerCase()).toContain("qwen");
  });

  it("resolves providers by id with the right API format", () => {
    expect(getProvider("openrouter")?.apiFormat).toBe("openai");
    expect(getProvider("openai")?.apiFormat).toBe("openai");
    expect(getProvider("dashscope")?.apiFormat).toBe("openai");
    expect(getProvider("anthropic")?.apiFormat).toBe("anthropic");
    expect(getProvider("gemini")?.apiFormat).toBe("gemini");
    expect(getProvider("nope")).toBeUndefined();
  });
});

describe("parseVerdicts", () => {
  const verdicts = [{ sc: "1.1.1", verdict: "fail", confidence: 0.9, reasoning: "no alt" }];

  it("parses a JSON string", () => {
    const out = parseVerdicts(JSON.stringify({ verdicts }));
    expect(out?.[0]).toMatchObject({ sc: "1.1.1", verdict: "Failed", confidence: 0.9 });
  });

  it("parses an already-parsed object", () => {
    const out = parseVerdicts({ verdicts });
    expect(out?.[0]?.verdict).toBe("Failed");
  });

  it("extracts JSON embedded in prose", () => {
    const out = parseVerdicts(`Here it is:\n${JSON.stringify({ verdicts })}\ndone`);
    expect(out?.[0]?.sc).toBe("1.1.1");
  });

  it("maps pass→Passed and needs-review→CannotTell", () => {
    const out = parseVerdicts({
      verdicts: [
        { sc: "1.2.1", verdict: "pass", confidence: 1, reasoning: "" },
        { sc: "1.2.2", verdict: "needs-review", confidence: 0.5, reasoning: "" },
      ],
    });
    expect(out?.map((v) => v.verdict)).toEqual(["Passed", "CannotTell"]);
  });

  it("returns null for garbage", () => {
    expect(parseVerdicts("no json here")).toBeNull();
  });
});
