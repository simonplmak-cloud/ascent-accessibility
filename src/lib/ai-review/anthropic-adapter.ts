import type { AiReview, VisionModel } from "./types";
import { parseVerdicts } from "./parse";
import { resolveSettings, type AiSettings } from "./settings";

export interface AnthropicOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  fetchFn?: typeof fetch | undefined;
}

// Anthropic Messages API (vision). No audio input, so no AudioModel here.
export class AnthropicVisionClient implements VisionModel {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly fetchFn: typeof fetch;

  constructor(opts: AnthropicOptions) {
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
  }): Promise<AiReview[]> {
    const s = resolveSettings(input.settings);
    const base64 = input.image.toString("base64");
    const res = await this.fetchFn(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: s.maxTokens,
        temperature: s.temperature,
        top_p: s.topP,
        ...(input.system ? { system: input.system } : {}),
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
              { type: "text", text: input.prompt },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(s.timeoutMs),
    });
    if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
    const json = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text = (json.content ?? [])
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("\n");
    return parseVerdicts(text) ?? [];
  }
}
