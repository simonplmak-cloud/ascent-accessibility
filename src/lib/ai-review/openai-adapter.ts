import type { AiReview, VisionModel } from "./types";
import type { AudioModel } from "./audio";
import { parseVerdicts } from "./parse";
import { fetchMedia } from "./media";
import { resolveSettings, type AiSettings } from "./settings";

export interface OpenAiClientOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  fetchFn?: typeof fetch;
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
  const messages = [
    ...(system ? [{ role: "system", content: system }] : []),
    { role: "user", content },
  ];
  const res = await fetchFn(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: s.temperature,
      top_p: s.topP,
      max_tokens: s.maxTokens,
      seed: s.seed,
      messages,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(s.timeoutMs),
  });
  if (!res.ok) throw new Error(`OpenAI-compatible HTTP ${res.status}`);
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
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
  }): Promise<AiReview[]> {
    const base64 = input.image.toString("base64");
    const content = [
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
      { type: "text", text: input.prompt },
    ];
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
