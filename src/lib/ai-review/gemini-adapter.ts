import type { AiReview, VisionModel } from "./types";
import type { AudioModel } from "./audio";
import { parseVerdicts } from "./parse";
import { fetchMedia } from "./media";
import { resolveSettings, type AiSettings } from "./settings";

export interface GeminiOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  fetchFn?: typeof fetch | undefined;
}

async function generateContent(
  baseUrl: string,
  apiKey: string,
  model: string,
  parts: Array<Record<string, unknown>>,
  fetchFn: typeof fetch,
  system?: string,
  settings?: AiSettings,
): Promise<AiReview[]> {
  const s = resolveSettings(settings);
  const res = await fetchFn(`${baseUrl}/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      generationConfig: {
        temperature: s.temperature,
        topP: s.topP,
        maxOutputTokens: s.maxTokens,
        seed: s.seed,
      },
      contents: [{ parts }],
    }),
    signal: AbortSignal.timeout(s.timeoutMs),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = (json.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("\n");
  return parseVerdicts(text) ?? [];
}

export class GeminiVisionClient implements VisionModel {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly fetchFn: typeof fetch;

  constructor(opts: GeminiOptions) {
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
    const parts = [
      { inlineData: { mimeType: "image/jpeg", data: base64 } },
      { text: input.prompt },
    ];
    return generateContent(this.baseUrl, this.apiKey, this.model, parts, this.fetchFn, input.system, input.settings);
  }
}

export class GeminiAudioClient implements AudioModel {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly fetchFn: typeof fetch;

  constructor(opts: GeminiOptions) {
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
    const parts: Array<Record<string, unknown>> = [{ text: input.prompt }];
    for (const url of input.mediaUrls.slice(0, 5)) {
      const media = await fetchMedia(url, this.fetchFn);
      if (media) {
        parts.push({ inlineData: { mimeType: media.mimeType, data: media.data } });
      }
    }
    return generateContent(this.baseUrl, this.apiKey, this.model, parts, this.fetchFn, input.system, input.settings);
  }
}
