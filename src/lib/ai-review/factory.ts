import type { VisionModel } from "./types";
import type { AudioModel } from "./audio";
import { getProvider, type AiProvider } from "./providers";
import { OpenAiAudioClient, OpenAiVisionClient } from "./openai-adapter";
import { AnthropicVisionClient } from "./anthropic-adapter";
import { GeminiAudioClient, GeminiVisionClient } from "./gemini-adapter";

export interface ModelRequest {
  providerId: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  fetchFn?: typeof fetch;
}

function resolveProvider(req: ModelRequest): { provider: AiProvider; baseUrl: string } {
  const provider = getProvider(req.providerId);
  if (!provider) throw new Error(`unknown provider: ${req.providerId}`);
  if (provider.id === "custom") {
    if (!req.baseUrl || !/^https:\/\//i.test(req.baseUrl)) {
      throw new Error("custom provider requires an https base URL");
    }
    return { provider, baseUrl: req.baseUrl };
  }
  return { provider, baseUrl: req.baseUrl || provider.baseUrl };
}

export function createVisionModel(req: ModelRequest): VisionModel {
  const { provider, baseUrl } = resolveProvider(req);
  const opts = { apiKey: req.apiKey, baseUrl, model: req.model, fetchFn: req.fetchFn };
  switch (provider.apiFormat) {
    case "anthropic":
      return new AnthropicVisionClient(opts);
    case "gemini":
      return new GeminiVisionClient(opts);
    default:
      return new OpenAiVisionClient(opts);
  }
}

export function createAudioModel(req: ModelRequest): AudioModel | null {
  const { provider, baseUrl } = resolveProvider(req);
  const opts = { apiKey: req.apiKey, baseUrl, model: req.model, fetchFn: req.fetchFn };
  switch (provider.apiFormat) {
    case "anthropic":
      return null; // no audio input support
    case "gemini":
      return new GeminiAudioClient(opts);
    default:
      return new OpenAiAudioClient(opts);
  }
}

// Cheap, time-boxed key validation against the provider's endpoint.
export async function validateProviderKey(
  providerId: string,
  apiKey: string,
  baseUrl?: string,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  const provider = getProvider(providerId);
  if (!provider) return false;
  const base = (provider.id === "custom" ? (baseUrl ?? "") : provider.baseUrl).replace(/\/$/, "");
  if (!base) return false;

  const headers: Record<string, string> =
    provider.auth === "x-api-key"
      ? { "x-api-key": apiKey, "anthropic-version": "2023-06-01" }
      : provider.auth === "x-goog-api-key"
        ? { "x-goog-api-key": apiKey }
        : { Authorization: `Bearer ${apiKey}` };

  try {
    const res = await fetchFn(`${base}${provider.validateEndpoint}`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
