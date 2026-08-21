import { describe, expect, it } from "vitest";
import { suggestFix } from "@/lib/ai-fix";

const finding = {
  ruleId: "image-alt",
  description: "Images must have alternate text",
  recommendation: "Add a short text alternative.",
  sc: "1.1.1",
  html: '<img src="logo.png">',
  target: "img",
};

const validSuggestion = {
  fix: 'Add alt="Company logo" to the <img>.',
  confidence: 0.9,
  why: "Screen-reader users hear the image's purpose.",
  avoid: 'Don\'t use alt="image" or the filename.',
  verify: "Listen to the image with a screen reader.",
};

function fetchReturning(payload: unknown, status = 200): typeof fetch {
  return (async () =>
    new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(payload) } }] }), {
      status,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;
}

function fetchWithContent(content: string): typeof fetch {
  return (async () =>
    new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 })) as typeof fetch;
}

const base = { apiKey: "k", baseUrl: "https://api.example.com/v1", model: "m", finding };

describe("suggestFix", () => {
  it("returns a validated suggestion for a well-formed AI response", async () => {
    const result = await suggestFix({ ...base, fetchFn: fetchReturning(validSuggestion) });
    expect(result).toEqual(validSuggestion);
  });

  it("returns null for a schema-mismatched response", async () => {
    const result = await suggestFix({ ...base, fetchFn: fetchReturning({ fix: "only fix" }) });
    expect(result).toBeNull();
  });

  it("returns null when the content is not valid JSON", async () => {
    const result = await suggestFix({ ...base, fetchFn: fetchWithContent("not json") });
    expect(result).toBeNull();
  });

  it("returns null on a non-OK provider response", async () => {
    const result = await suggestFix({ ...base, fetchFn: fetchReturning({}, 500) });
    expect(result).toBeNull();
  });

  it("returns null on a network error", async () => {
    const fetchFn = (async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    const result = await suggestFix({ ...base, fetchFn });
    expect(result).toBeNull();
  });
});
