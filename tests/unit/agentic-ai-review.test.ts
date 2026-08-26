import { describe, expect, it, vi } from "vitest";
import { AI_TOOLS, AI_TOOL_IMPL, toolImplByName } from "@/lib/ai-review/tools";
import { OpenAiVisionClient } from "@/lib/ai-review/openai-adapter";
import { runTriage } from "@/lib/ai-review/triage";
import type { ScAiConfig } from "@/lib/ai-review/sc-config";
import type { AiReview } from "@/lib/ai-review/types";

function toolJudgedCfg(sc: string, judgeable: boolean): ScAiConfig {
  return {
    sc,
    instructionId: `${sc}.1`,
    modality: "vision",
    judgeable,
    instruction: "i",
    whatToLookFor: ["w"],
    passRequires: ["p"],
    failRequires: ["f"],
    ruleId: `ai-${sc}`,
    description: "d",
    recommendation: "r",
    help: "h",
    source: "test",
    notes: "",
    enabled: true,
  };
}

describe("AI tool catalog", () => {
  it("exposes 12 tools, each with a name, description, JSON schema, and impl", () => {
    expect(AI_TOOLS).toHaveLength(12);
    for (const t of AI_TOOLS) {
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.parameters).toHaveProperty("type", "object");
      expect(toolImplByName(t.name), `${t.name} has no impl`).toBeTruthy();
    }
    expect(Object.keys(AI_TOOL_IMPL)).toHaveLength(12);
  });
});

describe("OpenAiVisionClient tool-calling loop", () => {
  it("runs a tool then parses the verdict JSON (AC-1)", async () => {
    const fakeFetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { messages: Array<Record<string, unknown>> };
      const hasToolResult = body.messages.some((m) => m.role === "tool");
      if (!hasToolResult) {
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: null,
                  tool_calls: [{ id: "call_1", function: { name: "get_links", arguments: "{}" } }],
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  verdicts: [{ sc: "2.4.4", verdict: "pass", confidence: 0.9, reasoning: "links are clear" }],
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const client = new OpenAiVisionClient({
      apiKey: "k",
      baseUrl: "https://example.com/v1",
      model: "m",
      fetchFn: fakeFetch as unknown as typeof fetch,
    });
    const run = vi.fn(async () => ({ links: [] }));
    const result = await client.review({
      image: Buffer.alloc(0),
      prompt: "Assess 2.4.4",
      tools: { run },
    });

    expect(run).toHaveBeenCalledWith("get_links", {});
    expect(fakeFetch).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ sc: "2.4.4", verdict: "Passed", confidence: 0.9 });
  });

  it("sends tools in OpenAI function-calling wire format", async () => {
    let toolsPayload: unknown;
    const fakeFetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { tools?: unknown };
      if (body.tools) toolsPayload = body.tools;
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify({ verdicts: [] }) } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    const client = new OpenAiVisionClient({
      apiKey: "k",
      baseUrl: "https://example.com/v1",
      model: "m",
      fetchFn: fakeFetch as unknown as typeof fetch,
    });
    await client.review({ image: Buffer.alloc(0), prompt: "p", tools: { run: async () => ({}) } });

    const tools = toolsPayload as Array<Record<string, unknown>>;
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
    expect(tools[0]).toMatchObject({ type: "function" });
    expect(tools[0]?.function).toMatchObject({ name: "get_a11y_tree" });
    expect(tools[0]?.function).toHaveProperty("parameters");
  });

  it("prefers an inline verdict co-emitted with tool_calls (AC-1)", async () => {
    const fakeFetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  verdicts: [{ sc: "2.4.4", verdict: "pass", confidence: 0.9, reasoning: "links clear" }],
                }),
                tool_calls: [{ id: "call_1", function: { name: "get_links", arguments: "{}" } }],
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const client = new OpenAiVisionClient({
      apiKey: "k",
      baseUrl: "https://example.com/v1",
      model: "m",
      fetchFn: fakeFetch as unknown as typeof fetch,
    });
    const run = vi.fn(async () => ({ links: [] }));
    const result = await client.review({ image: Buffer.alloc(0), prompt: "Assess 2.4.4", tools: { run } });
    expect(run).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ sc: "2.4.4", verdict: "Passed" });
  });

  it("forces a final verdict round after the tool loop (AC-2)", async () => {
    let call = 0;
    const fakeFetch = vi.fn(async () => {
      call += 1;
      if (call <= 4) {
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: null,
                  tool_calls: [{ id: `call_${call}`, function: { name: "get_links", arguments: "{}" } }],
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  verdicts: [{ sc: "2.4.4", verdict: "pass", confidence: 0.9, reasoning: "links clear" }],
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    const client = new OpenAiVisionClient({
      apiKey: "k",
      baseUrl: "https://example.com/v1",
      model: "m",
      fetchFn: fakeFetch as unknown as typeof fetch,
    });
    const result = await client.review({
      image: Buffer.alloc(0),
      prompt: "Assess 2.4.4",
      tools: { run: async () => ({ links: [] }) },
    });
    expect(fakeFetch).toHaveBeenCalledTimes(5); // 4 tool rounds + 1 forced final
    expect(result[0]).toMatchObject({ sc: "2.4.4", verdict: "Passed" });
  });

  it("degrades to a single call when no tools are provided (AC-4)", async () => {
    const fakeFetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  verdicts: [{ sc: "1.3.3", verdict: "needs-review", confidence: 0.1, reasoning: "unclear" }],
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const client = new OpenAiVisionClient({
      apiKey: "k",
      baseUrl: "https://example.com/v1",
      model: "m",
      fetchFn: fakeFetch as unknown as typeof fetch,
    });
    const result = await client.review({ image: Buffer.alloc(0), prompt: "p" });
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(result[0]).toMatchObject({ sc: "1.3.3", verdict: "CannotTell" });
  });
});

describe("runTriage tool-aware judgeability", () => {
  it("sends judgeable:false criteria to the model when tools are available", async () => {
    const review = vi.fn(async (): Promise<AiReview[]> => [{ sc: "2.4.11", verdict: "Passed", confidence: 0.9, reasoning: "r" }]);
    const out = await runTriage({
      model: { review },
      image: Buffer.alloc(0),
      unresolvedScs: ["2.4.11"],
      getConfig: async () => toolJudgedCfg("2.4.11", false),
      tools: { run: async () => ({}) },
    });
    expect(review).toHaveBeenCalledTimes(1);
    expect(out.reviews[0]).toMatchObject({ sc: "2.4.11", verdict: "Passed" });
  });

  it("short-circuits judgeable:false criteria when tools are absent", async () => {
    const review = vi.fn(async (): Promise<AiReview[]> => []);
    const out = await runTriage({
      model: { review },
      image: Buffer.alloc(0),
      unresolvedScs: ["2.4.11"],
      getConfig: async () => toolJudgedCfg("2.4.11", false),
    });
    expect(review).not.toHaveBeenCalled();
    expect(out.reviews[0]).toMatchObject({ verdict: "CannotTell" });
    expect(out.budget.calls).toBe(0);
  });
});
