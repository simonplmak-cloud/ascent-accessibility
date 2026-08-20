import { aiConfigRepository } from "@/db/repository";
import { DEFAULT_AI_CONFIGS, getDefaultAiConfig, type ScAiConfig } from "./sc-config";

// Cached config store: DB overrides (real, human-authored rows) are merged over
// the code defaults. On DB error the code default is returned — the pipeline
// never breaks, and the DB is never seeded.
const DEFAULT_TTL_MS = 60_000;

export interface ConfigStore {
  get(sc: string): Promise<ScAiConfig>;
  getAll(): Promise<Map<string, ScAiConfig>>;
}

export function createConfigStore(
  list: () => Promise<ScAiConfig[]>,
  ttlMs: number = DEFAULT_TTL_MS,
): ConfigStore {
  let cache: Map<string, ScAiConfig> | null = null;
  let loadedAt = 0;

  async function load(): Promise<Map<string, ScAiConfig>> {
    const now = Date.now();
    if (cache && now - loadedAt < ttlMs) return cache;
    try {
      const rows = await list();
      const map = new Map<string, ScAiConfig>();
      for (const row of rows) map.set(row.sc, row);
      cache = map;
      loadedAt = now;
      return map;
    } catch {
      return cache ?? new Map();
    }
  }

  return {
    async get(sc: string): Promise<ScAiConfig> {
      const override = (await load()).get(sc);
      const def = getDefaultAiConfig(sc);
      if (!def) return synthesizedDefault(sc);
      return override ? { ...def, ...override } : def;
    },
    async getAll(): Promise<Map<string, ScAiConfig>> {
      const overrides = await load();
      const map = new Map<string, ScAiConfig>();
      for (const sc of Object.keys(DEFAULT_AI_CONFIGS)) {
        const def = getDefaultAiConfig(sc)!;
        const override = overrides.get(sc);
        map.set(sc, override ? { ...def, ...override } : def);
      }
      return map;
    },
  };
}

// Synthesize a conservative config for an SC with no default (never a crash).
function synthesizedDefault(sc: string): ScAiConfig {
  return {
    sc,
    instructionId: `${sc}.1`,
    modality: "vision",
    judgeable: false,
    instruction: "Manual review required",
    whatToLookFor: [],
    passRequires: [],
    failRequires: [],
    ruleId: `ai-${sc}`,
    description: `WCAG ${sc} requires manual review`,
    recommendation: `Review WCAG ${sc} manually.`,
    help: `WCAG ${sc}`,
    source: "unknown",
    notes: "synthesized default",
    enabled: true,
  };
}

export const configStore: ConfigStore = createConfigStore(() => aiConfigRepository.list());

export const getAiConfig = (sc: string): Promise<ScAiConfig> => configStore.get(sc);
export const getAiConfigs = (): Promise<Map<string, ScAiConfig>> => configStore.getAll();
