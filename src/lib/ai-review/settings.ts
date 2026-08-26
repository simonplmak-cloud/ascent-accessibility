// Deterministic extraction settings + per-criterion override merge.
export interface AiSettings {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  seed?: number;
  confidenceThreshold?: number;
  retries?: number;
  timeoutMs?: number;
  enableThinking?: boolean;
  enableSearch?: boolean;
}

export const DEFAULT_AI_SETTINGS: Required<AiSettings> = {
  temperature: 0,
  topP: 1,
  maxTokens: 2048,
  seed: 42,
  confidenceThreshold: 0.8,
  retries: 1,
  timeoutMs: 60_000,
  enableThinking: false,
  enableSearch: false,
};

// Partial-merge a per-criterion override over the global defaults.
export function resolveSettings(override?: AiSettings): Required<AiSettings> {
  return { ...DEFAULT_AI_SETTINGS, ...override };
}
