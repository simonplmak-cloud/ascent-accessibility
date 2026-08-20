import { query } from "../index";
import type { ScAiConfig } from "@/lib/ai-review/sc-config";
import type { AiSettings } from "@/lib/ai-review/settings";

type RawRecord = Record<string, unknown>;

function parseList(v: unknown): string[] {
  if (typeof v !== "string" || !v) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function parseExamples(v: unknown): { pass?: string; fail?: string } | undefined {
  if (typeof v !== "string" || !v) return undefined;
  try {
    return JSON.parse(v) as { pass?: string; fail?: string };
  } catch {
    return undefined;
  }
}

function parseSettings(v: unknown): AiSettings | undefined {
  if (typeof v !== "string" || !v) return undefined;
  try {
    return JSON.parse(v) as AiSettings;
  } catch {
    return undefined;
  }
}

function mapConfig(raw: RawRecord): ScAiConfig {
  return {
    sc: String(raw.sc),
    instructionId: String(raw.instructionId),
    modality: raw.modality === "audio" ? "audio" : "vision",
    judgeable: raw.judgeable === true,
    instruction: String(raw.instruction),
    whatToLookFor: parseList(raw.whatToLookFor),
    passRequires: parseList(raw.passRequires),
    failRequires: parseList(raw.failRequires),
    examples: parseExamples(raw.examples),
    ruleId: String(raw.ruleId),
    description: String(raw.description),
    recommendation: String(raw.recommendation),
    help: String(raw.help),
    source: String(raw.source),
    notes: String(raw.notes),
    settings: parseSettings(raw.settings),
    enabled: raw.enabled !== false,
  };
}

export const aiConfigRepository = {
  async list(): Promise<ScAiConfig[]> {
    const rows = await query<RawRecord>("SELECT * FROM ai_sc_config WHERE enabled = true");
    return rows.map(mapConfig);
  },
};
