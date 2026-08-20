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

describe("settings threading (AC-13)", () => {
  const settings = { temperature: 0.2, topP: 0.9, maxTokens: 128, seed: 7 };

  function captureFetch(json: unknown): { fn: typeof fetch; body: () => Record<string, unknown> } {
    const captured: { body?: Record<string, unknown> } = {};
    const fn = (async (_url: string, init?: RequestInit) => {
      captured.body = JSON.parse(String(init?.body));
      return new Response(JSON.stringify(json), { status: 200 });
    }) as unknown as typeof fetch;
    return { fn, body: () => captured.body ?? {} };
  }

  it("openai sends temperature/top_p/max_tokens/seed", async () => {
    const { fn, body } = captureFetch({ choices: [{ message: { content: '{"verdicts":[]}' } }] });
    const client = new OpenAiVisionClient({
      apiKey: "k",
      baseUrl: "https://x.example/v1",
      model: "m",
      fetchFn: fn,
    });
    await client.review({ image: Buffer.from("x"), prompt: "p", settings });
    expect(body()).toMatchObject({ temperature: 0.2, top_p: 0.9, max_tokens: 128, seed: 7 });
  });

  it("anthropic sends max_tokens/temperature/top_p (no seed)", async () => {
    const { fn, body } = captureFetch({ content: [{ type: "text", text: '{"verdicts":[]}' }] });
    const client = new AnthropicVisionClient({
      apiKey: "k",
      baseUrl: "https://x.example/v1",
      model: "m",
      fetchFn: fn,
    });
    await client.review({ image: Buffer.from("x"), prompt: "p", settings });
    expect(body()).toMatchObject({ temperature: 0.2, top_p: 0.9, max_tokens: 128 });
  });

  it("gemini sends generationConfig with temperature/topP/maxOutputTokens/seed", async () => {
    const { fn, body } = captureFetch({
      candidates: [{ content: { parts: [{ text: '{"verdicts":[]}' }] } }],
    });
    const client = new GeminiVisionClient({
      apiKey: "k",
      baseUrl: "https://x.example/v1",
      model: "m",
      fetchFn: fn,
    });
    await client.review({ image: Buffer.from("x"), prompt: "p", settings });
    expect(body().generationConfig).toMatchObject({
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 128,
      seed: 7,
    });
  });
});
