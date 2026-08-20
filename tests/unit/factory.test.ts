import { describe, expect, it } from "vitest";
import {
  createAudioModel,
  createVisionModel,
  validateProviderKey,
} from "@/lib/ai-review/factory";
import { OpenAiAudioClient, OpenAiVisionClient } from "@/lib/ai-review/openai-adapter";
import { AnthropicVisionClient } from "@/lib/ai-review/anthropic-adapter";
import { GeminiAudioClient, GeminiVisionClient } from "@/lib/ai-review/gemini-adapter";

const req = (providerId: string) => ({ providerId, apiKey: "sk-test", model: "m" });

describe("factory dispatch", () => {
  it("dispatches vision clients by provider format", () => {
    expect(createVisionModel(req("openrouter"))).toBeInstanceOf(OpenAiVisionClient);
    expect(createVisionModel(req("openai"))).toBeInstanceOf(OpenAiVisionClient);
    expect(createVisionModel(req("anthropic"))).toBeInstanceOf(AnthropicVisionClient);
    expect(createVisionModel(req("gemini"))).toBeInstanceOf(GeminiVisionClient);
  });

  it("dispatches audio clients; anthropic returns null", () => {
    expect(createAudioModel(req("gemini"))).toBeInstanceOf(GeminiAudioClient);
    expect(createAudioModel(req("openai"))).toBeInstanceOf(OpenAiAudioClient);
    expect(createAudioModel(req("anthropic"))).toBeNull();
  });

  it("throws on an unknown provider", () => {
    expect(() => createVisionModel(req("nope"))).toThrow(/unknown provider/);
  });

  it("requires an https base URL for custom", () => {
    expect(() => createVisionModel({ ...req("custom"), baseUrl: "http://x" })).toThrow(/https/);
    expect(() =>
      createVisionModel({ ...req("custom"), baseUrl: "https://x.example/v1" }),
    ).not.toThrow();
  });
});

describe("validateProviderKey", () => {
  const ok = (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
  const bad = (async () => new Response("{}", { status: 401 })) as unknown as typeof fetch;

  it("returns true for a 200", async () => {
    await expect(validateProviderKey("openai", "k", undefined, ok)).resolves.toBe(true);
  });

  it("returns false for a 401", async () => {
    await expect(validateProviderKey("openai", "k", undefined, bad)).resolves.toBe(false);
  });

  it("returns false for an unknown provider", async () => {
    await expect(validateProviderKey("nope", "k", undefined, ok)).resolves.toBe(false);
  });
});
