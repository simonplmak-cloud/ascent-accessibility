import type { Impact } from "@/lib/scoring";
import type { Finding } from "@/db/schema";
import { getSc, specUrl } from "@/lib/standards/wcag-sc";
import type { AiBudget, AiReview, VisionModel } from "./types";
import { buildScPrompt, buildTriageSystemPrompt } from "./prompt";
import { getAiConfig } from "./config-store";
import type { ScAiConfig } from "./sc-config";
import { resolveSettings } from "./settings";

export const AI_CONFIDENCE_THRESHOLD = 0.8;

export type GetConfig = (sc: string) => Promise<ScAiConfig>;

export function resolveVerdict(
  sc: string,
  verdicts: readonly AiReview[],
  threshold: number = AI_CONFIDENCE_THRESHOLD,
): AiReview {
  const found = verdicts.find((v) => v.sc === sc);
  if (!found) return { sc, verdict: "CannotTell", confidence: 0, reasoning: "no verdict returned" };
  if (found.verdict === "CannotTell") return found;
  if (found.confidence < threshold) return { ...found, verdict: "CannotTell" };
  return found;
}

export function impactForScLevel(sc: string): Impact {
  const level = getSc(sc)?.level;
  if (level === "A") return "serious";
  if (level === "AA") return "moderate";
  return "minor";
}

// Build a finding that matches the engine `Finding` shape: curated rule id,
// description, recommendation, and help from the config; the model's reasoning
// is preserved as evidence (instances/sources), never as prose.
export function aiFailToFinding(config: ScAiConfig, review: AiReview, pageUrl: string): Finding {
  const sc = getSc(config.sc);
  const impact = impactForScLevel(config.sc);
  return {
    ruleId: config.ruleId,
    impact,
    description: config.description,
    pageUrl,
    elementCount: 1,
    recommendation: config.recommendation,
    help: config.help,
    helpUrl: sc ? specUrl(sc) : "",
    wcagSc: [config.sc],
    wcagLevel: sc?.level ?? null,
    scTitle: sc?.title ?? config.sc,
    confidence: "single-source",
    sources: [{ tool: "ai", ruleId: config.ruleId, impact, message: review.reasoning }],
    instances: [
      {
        target: "",
        html: "",
        failureSummary: review.reasoning,
        evidenceId: review.evidenceId ?? null,
      },
    ],
  };
}

export async function applyAiVerdicts(
  findings: Finding[],
  passedScs: ReadonlySet<string>,
  verdicts: readonly AiReview[],
  pageUrl: string,
  getConfig: GetConfig = getAiConfig,
): Promise<{ findings: Finding[]; passedScs: Set<string> }> {
  const nextFindings = [...findings];
  const nextPassed = new Set(passedScs);
  for (const review of verdicts) {
    if (review.verdict === "Passed") nextPassed.add(review.sc);
    else if (review.verdict === "Failed") {
      const config = await getConfig(review.sc);
      nextFindings.push(aiFailToFinding(config, review, pageUrl));
    }
  }
  return { findings: nextFindings, passedScs: nextPassed };
}

export interface TriageInput {
  model: VisionModel;
  image: Buffer;
  unresolvedScs: string[];
  incompleteContext?: string[];
  threshold?: number;
  getConfig?: GetConfig;
  locale?: string;
}

export interface TriageOutput {
  reviews: AiReview[];
  budget: AiBudget;
}

// One model call per judgeable criterion, each with its own config-driven
// prompt + settings. Non-judgeable/disabled criteria are needs-review with zero
// calls; a model/parse error retries once, then fails safe to CannotTell.
export async function runTriage(input: TriageInput): Promise<TriageOutput> {
  const unresolved = input.unresolvedScs;
  if (unresolved.length === 0) {
    return { reviews: [], budget: { calls: 0, images: 0 } };
  }

  const reviews: AiReview[] = [];
  let calls = 0;

  for (const sc of unresolved) {
    const config = await (input.getConfig ?? getAiConfig)(sc);

    if (!config.enabled) {
      reviews.push({ sc, verdict: "CannotTell", confidence: 0, reasoning: "config disabled" });
      continue;
    }
    if (!config.judgeable) {
      reviews.push({ sc, verdict: "CannotTell", confidence: 0, reasoning: "not judgeable from available evidence" });
      continue;
    }

    const settings = resolveSettings(config.settings);
    const prompt = buildScPrompt(config, input.locale);
    const system = buildTriageSystemPrompt(input.locale);

    calls += 1;
    let raw: AiReview[] | null = null;
    for (let attempt = 0; attempt <= settings.retries && raw === null; attempt++) {
      try {
        raw = await input.model.review({ image: input.image, prompt, system, settings });
      } catch {
        raw = null;
      }
    }

    if (raw === null) {
      reviews.push({ sc, verdict: "CannotTell", confidence: 0, reasoning: "model or parse error" });
      continue;
    }
    reviews.push(resolveVerdict(sc, raw, settings.confidenceThreshold));
  }

  return { reviews, budget: { calls, images: calls } };
}
