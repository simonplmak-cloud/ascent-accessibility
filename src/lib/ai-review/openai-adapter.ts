import type { AiReview, VisionModel, VisionReviewTools } from "./types";
import type { AudioModel } from "./audio";
import { parseVerdicts } from "./parse";
import { fetchMedia } from "./media";
import { resolveSettings, type AiSettings } from "./settings";
import { AI_TOOLS } from "./tools";

export interface OpenAiClientOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  fetchFn?: typeof fetch | undefined;
}

interface ToolCall {
  id: string;
  function: { name: string; arguments: string };
}

interface ChatMessage {
  role: string;
  content: unknown;
  tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>;
  tool_call_id?: string;
}

interface ChatResponse {
  choices?: Array<{ message?: { content?: unknown; tool_calls?: ToolCall[] } }>;
}

interface RequestOptions {
  tools?: Array<Record<string, unknown>>;
  toolChoice?: "auto";
  jsonObject?: boolean;
}

// One low-level chat-completions request. `jsonObject` forces the provider's
// JSON mode; `tools`/`toolChoice` are mutually exclusive with it.
async function requestChat(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  fetchFn: typeof fetch,
  s: Required<AiSettings>,
  opts: RequestOptions = {},
): Promise<ChatResponse> {
  const body: Record<string, unknown> = {
    model,
    temperature: s.temperature,
    top_p: s.topP,
    max_tokens: s.maxTokens,
    seed: s.seed,
    messages,
  };
  if (opts.jsonObject) body.response_format = { type: "json_object" };
  if (opts.tools) {
    body.tools = opts.tools;
    body.tool_choice = opts.toolChoice ?? "auto";
  }
  const res = await fetchFn(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(s.timeoutMs),
  });
  if (!res.ok) throw new Error(`OpenAI-compatible HTTP ${res.status}`);
  return (await res.json()) as ChatResponse;
}

async function chatCompletions(
  baseUrl: string,
  apiKey: string,
  model: string,
  content: Array<Record<string, unknown>>,
  fetchFn: typeof fetch,
  system?: string,
  settings?: AiSettings,
): Promise<AiReview[]> {
  const s = resolveSettings(settings);
  const messages: ChatMessage[] = [
    ...(system ? [{ role: "system", content: system } as ChatMessage] : []),
    { role: "user", content },
  ];
  const json = await requestChat(baseUrl, apiKey, model, messages, fetchFn, s, { jsonObject: true });
  return parseVerdicts(json.choices?.[0]?.message?.content) ?? [];
}

// Tool-calling vision loop: the model may invoke the browser tools over up to
// 4 rounds before emitting the JSON verdict. Two exit paths to a verdict:
//   1. a non-empty `content` in any round — captured even when the message also
//      carries tool_calls (the verdict is preferred over more tool use);
//   2. after the tool loop, one forced no-tools round (json_object) with an
//      explicit "return your verdict" instruction.
async function chatCompletionsWithTools(
  baseUrl: string,
  apiKey: string,
  model: string,
  content: Array<Record<string, unknown>>,
  fetchFn: typeof fetch,
  tools: VisionReviewTools,
  system?: string,
  settings?: AiSettings,
): Promise<AiReview[]> {
  const s = resolveSettings(settings);
  const messages: ChatMessage[] = [
    ...(system ? [{ role: "system", content: system } as ChatMessage] : []),
    { role: "user", content },
  ];
  // OpenAI function-calling wire format: each tool is wrapped in
  // `{ type: "function", function: { name, description, parameters } }`.
  const toolDefs = AI_TOOLS.map((t) => ({
    type: "function",
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
  const MAX_ROUNDS = 4;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const json = await requestChat(baseUrl, apiKey, model, messages, fetchFn, s, {
      tools: toolDefs,
      toolChoice: "auto",
    });
    const msg = json.choices?.[0]?.message;
    if (!msg) break;

    // A verdict can be co-emitted with tool_calls — prefer it over more tool use.
    if (msg.content) {
      const parsed = parseVerdicts(msg.content);
      if (parsed && parsed.length > 0) return parsed;
    }

    const toolCalls = msg.tool_calls ?? [];
    if (toolCalls.length === 0) break; // no tools and no parseable verdict → force final round

    messages.push({ role: "assistant", content: msg.content ?? null, tool_calls: toolCalls });
    for (const tc of toolCalls) {
      let result: unknown;
      try {
        const args = JSON.parse(tc.function.arguments || "{}") as Record<string, unknown>;
        result = await tools.run(tc.function.name, args);
      } catch {
        result = { error: "tool failed" };
      }
      messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
    }
  }

  // Forced final: no tools, JSON-only, explicit instruction to emit the verdict.
  messages.push({
    role: "user",
    content: "Return your verdict JSON now (no more tool calls).",
  });
  const json = await requestChat(baseUrl, apiKey, model, messages, fetchFn, s, { jsonObject: true });
  return parseVerdicts(json.choices?.[0]?.message?.content) ?? [];
}

export class OpenAiVisionClient implements VisionModel {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly fetchFn: typeof fetch;

  constructor(opts: OpenAiClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
    this.model = opts.model;
    this.fetchFn = opts.fetchFn ?? fetch;
  }

  async review(input: {
    image: Buffer;
    prompt: string;
    system?: string;
    settings?: AiSettings;
    tools?: VisionReviewTools;
  }): Promise<AiReview[]> {
    const base64 = input.image.toString("base64");
    const content = [
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
      { type: "text", text: input.prompt },
    ];
    if (input.tools) {
      return chatCompletionsWithTools(
        this.baseUrl,
        this.apiKey,
        this.model,
        content,
        this.fetchFn,
        input.tools,
        input.system,
        input.settings,
      );
    }
    return chatCompletions(this.baseUrl, this.apiKey, this.model, content, this.fetchFn, input.system, input.settings);
  }
}

export class OpenAiAudioClient implements AudioModel {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly fetchFn: typeof fetch;

  constructor(opts: OpenAiClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
    this.model = opts.model;
    this.fetchFn = opts.fetchFn ?? fetch;
  }

  async review(input: {
    mediaUrls: string[];
    scs: string[];
    prompt: string;
    system?: string;
    settings?: AiSettings;
  }): Promise<AiReview[]> {
    const content: Array<Record<string, unknown>> = [{ type: "text", text: input.prompt }];
    for (const url of input.mediaUrls.slice(0, 5)) {
      const media = await fetchMedia(url, this.fetchFn);
      if (media) {
        content.push({ type: "input_audio", input_audio: { data: media.data, format: media.format } });
      }
    }
    return chatCompletions(this.baseUrl, this.apiKey, this.model, content, this.fetchFn, input.system, input.settings);
  }
}
