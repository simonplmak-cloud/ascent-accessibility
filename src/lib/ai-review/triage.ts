import type { Impact } from "@/lib/scoring";
import type { Finding } from "@/db/schema";
import { getSc, specUrl } from "@/lib/standards/wcag-sc";
import type { AiBudget, AiReview, VisionModel } from "./types";
import { buildTriagePrompt, buildTriageScs, buildTriageSystemPrompt } from "./prompt";

export const AI_CONFIDENCE_THRESHOLD = 0.8;
const TRIAGE_CHUNK_SIZE = 6;

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

export function aiFailToFinding(review: AiReview, pageUrl: string): Finding {
  const sc = getSc(review.sc);
  const impact = impactForScLevel(review.sc);
  return {
    ruleId: `ai-${review.sc}`,
    impact,
    description: `AI review failed WCAG ${review.sc}${sc ? ` (${sc.title})` : ""}: ${review.reasoning}`,
    pageUrl,
    elementCount: 1,
    recommendation: `Address WCAG ${review.sc}${sc ? ` (${sc.title})` : ""}: ${review.reasoning}`,
    help: `WCAG ${review.sc}`,
    helpUrl: sc ? specUrl(sc) : "",
    wcagSc: [review.sc],
    wcagLevel: sc?.level ?? null,
    scTitle: sc?.title ?? "AI review",
    confidence: "single-source",
    sources: [
      { tool: "ai", ruleId: `ai-${review.sc}`, impact, message: review.reasoning },
    ],
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

export function applyAiVerdicts(
  findings: Finding[],
  passedScs: ReadonlySet<string>,
  verdicts: readonly AiReview[],
  pageUrl: string,
): { findings: Finding[]; passedScs: Set<string> } {
  const nextFindings = [...findings];
  const nextPassed = new Set(passedScs);
  for (const review of verdicts) {
    if (review.verdict === "Passed") nextPassed.add(review.sc);
    else if (review.verdict === "Failed") nextFindings.push(aiFailToFinding(review, pageUrl));
  }
  return { findings: nextFindings, passedScs: nextPassed };
}

export interface TriageInput {
  model: VisionModel;
  image: Buffer;
  unresolvedScs: string[];
  incompleteContext?: string[];
  threshold?: number;
}

export interface TriageOutput {
  reviews: AiReview[];
  budget: AiBudget;
}

export async function runTriage(input: TriageInput): Promise<TriageOutput> {
  const threshold = input.threshold ?? AI_CONFIDENCE_THRESHOLD;
  const unresolved = input.unresolvedScs;
  const incompleteContext = input.incompleteContext ?? [];

  if (unresolved.length === 0) {
    return { reviews: [], budget: { calls: 0, images: 0 } };
  }

  // Batch the SCs into small chunks — one large call risks truncating the model
  // response (dropping verdicts) and dilutes per-SC attention.
  const reviews: AiReview[] = [];
  let calls = 0;
  for (let i = 0; i < unresolved.length; i += TRIAGE_CHUNK_SIZE) {
    const chunk = unresolved.slice(i, i + TRIAGE_CHUNK_SIZE);
    const prompt = buildTriagePrompt(buildTriageScs(chunk), incompleteContext);
    calls += 1;
    try {
      const raw = await input.model.review({
        image: input.image,
        prompt,
        system: buildTriageSystemPrompt(),
      });
      reviews.push(...chunk.map((sc) => resolveVerdict(sc, raw, threshold)));
    } catch {
      // Fail-safe: a model/parse error leaves this chunk's SCs as Cannot tell.
      reviews.push(
        ...chunk.map((sc) => ({
          sc,
          verdict: "CannotTell" as const,
          confidence: 0,
          reasoning: "model or parse error",
        })),
      );
    }
  }

  return { reviews, budget: { calls, images: calls } };
}
