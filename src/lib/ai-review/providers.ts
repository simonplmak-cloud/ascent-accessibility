export type ApiFormat = "openai" | "anthropic" | "gemini";
export type AuthKind = "bearer" | "x-api-key" | "x-goog-api-key";

export interface AiModel {
  id: string;
  label: string;
}

export interface AiProvider {
  id: string;
  label: string;
  apiFormat: ApiFormat;
  baseUrl: string;
  auth: AuthKind;
  validateEndpoint: string;
  visionModels: AiModel[];
  audioModels: AiModel[];
}

export const DEFAULT_PROVIDER = "openrouter";
export const DEFAULT_VISION_MODEL = "qwen/qwen2.5-vl-72b-instruct";
export const DEFAULT_AUDIO_MODEL = "google/gemini-2.5-flash";

// Curated provider catalog. `custom` is an OpenAI-compatible endpoint where the
// user supplies both the base URL and a model id.
export const AI_PROVIDERS: AiProvider[] = [
  {
    id: "openrouter",
    label: "OpenRouter",
    apiFormat: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    auth: "bearer",
    validateEndpoint: "/key",
    visionModels: [
      { id: "qwen/qwen2.5-vl-72b-instruct", label: "Qwen 2.5 VL 72B (default)" },
      { id: "openai/gpt-4o", label: "GPT-4o" },
      { id: "openai/gpt-4o-mini", label: "GPT-4o mini" },
      { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
      { id: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
    ],
    audioModels: [{ id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (audio)" }],
  },
  {
    id: "openai",
    label: "OpenAI",
    apiFormat: "openai",
    baseUrl: "https://api.openai.com/v1",
    auth: "bearer",
    validateEndpoint: "/models",
    visionModels: [
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
    ],
    audioModels: [{ id: "gpt-4o-audio-preview", label: "GPT-4o audio" }],
  },
  {
    id: "dashscope",
    label: "Qwen / DashScope",
    apiFormat: "openai",
    baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    auth: "bearer",
    validateEndpoint: "/models",
    visionModels: [
      { id: "qwen-vl-plus", label: "Qwen-VL Plus" },
      { id: "qwen-vl-max", label: "Qwen-VL Max" },
    ],
    audioModels: [],
  },
  {
    id: "gemini",
    label: "Google Gemini",
    apiFormat: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    auth: "x-goog-api-key",
    validateEndpoint: "/models",
    visionModels: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    ],
    audioModels: [{ id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (audio)" }],
  },
  {
    id: "anthropic",
    label: "Anthropic",
    apiFormat: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    auth: "x-api-key",
    validateEndpoint: "/models",
    visionModels: [
      { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
      { id: "claude-3-7-sonnet-20250219", label: "Claude 3.7 Sonnet" },
    ],
    audioModels: [],
  },
  {
    id: "custom",
    label: "Custom (OpenAI-compatible)",
    apiFormat: "openai",
    baseUrl: "",
    auth: "bearer",
    validateEndpoint: "/models",
    visionModels: [],
    audioModels: [],
  },
];

export function getProvider(id: string): AiProvider | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}
