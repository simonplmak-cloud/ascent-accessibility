import { naturesOf } from "@/lib/standards/nature";

export type CannotTellReason =
  | "manual-only"
  | "not-judgeable-from-screenshot"
  | "engine-rule-pending"
  | "ai-low-confidence";

export interface AiVerdictLike {
  sc: string;
  verdict: string;
  reasoning: string;
  confidence?: number;
}

// Why a criterion is still "Cannot tell". AI verdicts carry the finest signal
// (their `reasoning`); otherwise we fall back to the criterion's nature taxonomy.
export function cannotTellReason(sc: string, aiVerdicts: AiVerdictLike[]): CannotTellReason {
  const ai = aiVerdicts.find((v) => v.sc === sc && v.verdict === "CannotTell");
  if (ai) {
    if (/not judgeable|config disabled|not judgeable from available evidence/i.test(ai.reasoning)) {
      return "not-judgeable-from-screenshot";
    }
    return "ai-low-confidence";
  }
  const natures = naturesOf(sc);
  if (natures.size === 1 && natures.has("manual-only")) return "manual-only";
  if (natures.has("machine-testable")) return "engine-rule-pending";
  if (natures.has("ai-detectable")) return "not-judgeable-from-screenshot";
  return "manual-only";
}
