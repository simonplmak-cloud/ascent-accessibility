import { computeConformance, finalizeConformance, type ConformanceResult } from "@/lib/scoring";
import type { PageFeatures } from "@/lib/standards/sc-applicability";
import { scsForStandard } from "@/lib/standards/version";
import type { WcagLevel } from "@/lib/standards/wcag-sc";
import type { AiBudget, AiReview, VisionModel, VisionReviewTools } from "@/lib/ai-review/types";
import { mediaScsFor, runAudioReview, type AudioModel } from "@/lib/ai-review/audio";
import { applyAiVerdicts, runTriage, type GetConfig } from "@/lib/ai-review/triage";
import { cannotTellReason } from "@/lib/standards/review-reason";
import type { Finding } from "@/db/schema";

export interface EvaluateInput {
  version: string;
  level: WcagLevel;
  findings: Finding[];
  passedScs: ReadonlySet<string>;
  matchedScs: ReadonlySet<string>;
  features: PageFeatures;
  pageUrl: string;
}

export interface EvaluateDeps {
  visionModel?: VisionModel | undefined;
  audioModel?: AudioModel | undefined;
  aiScreenshot?: Buffer | null | undefined;
  incompleteContext?: string[] | undefined;
  mediaUrls?: string[] | undefined;
  threshold?: number | undefined;
  getConfig?: GetConfig | undefined;
  locale?: string | undefined;
  pageLanguages?: string[] | undefined;
  tools?: VisionReviewTools | undefined;
}

export interface EvaluateOutput {
  conformance: ConformanceResult;
  findings: Finding[];
  aiVerdicts: AiReview[];
  aiBudget: AiBudget;
}

export async function evaluateStandard(
  input: EvaluateInput,
  deps: EvaluateDeps,
): Promise<EvaluateOutput> {
  const scs = scsForStandard(input.version, input.level);
  let findings = input.findings;
  let passedScs = new Set(input.passedScs);
  const aiVerdicts: AiReview[] = [];
  const aiBudget: AiBudget = { calls: 0, images: 0 };
  const resolved = new Map<string, "Passed" | "Failed">();

  let machine = computeConformance(scs, findings, passedScs, input.matchedScs, input.features);

  if (deps.visionModel && deps.aiScreenshot) {
    // Agentic backstop: every SC the machine left unresolved is eligible — the
    // model gathers interaction evidence (DOM/keyboard/focus) via the browser
    // tools and always asserts a verdict. No SC is reserved "manual-only".
    const eligible = machine.rows
      .filter((row) => row.result === "Unresolved")
      .map((row) => row.num);

    if (eligible.length > 0) {
      const triage = await runTriage({
        model: deps.visionModel,
        image: deps.aiScreenshot,
        unresolvedScs: eligible,
        incompleteContext: deps.incompleteContext ?? [],
        threshold: deps.threshold,
        getConfig: deps.getConfig,
        locale: deps.locale,
        pageLanguages: deps.pageLanguages,
        tools: deps.tools,
      });
      aiBudget.calls += triage.budget.calls;
      aiBudget.images += triage.budget.images;
      aiVerdicts.push(...triage.reviews);

      const applied = await applyAiVerdicts(findings, passedScs, triage.reviews, input.pageUrl, deps.getConfig);
      findings = applied.findings;
      passedScs = applied.passedScs;

      for (const review of triage.reviews) {
        if (review.verdict === "Passed") resolved.set(review.sc, "Passed");
        else if (review.verdict === "Failed") resolved.set(review.sc, "Failed");
      }

      machine = computeConformance(scs, findings, passedScs, input.matchedScs, input.features);
    }
  }

  // Audio review — resolve time-based-media SCs from the page's actual media.
  if (deps.audioModel && deps.mediaUrls && deps.mediaUrls.length > 0) {
    const mediaScs = mediaScsFor({
      hasVideo: input.features.hasVideo,
      hasAudio: input.features.hasAudio,
    });
    if (mediaScs.length > 0) {
      const audioVerdicts = await runAudioReview(deps.audioModel, mediaScs, deps.mediaUrls, deps.locale);
      const applied = await applyAiVerdicts(findings, passedScs, audioVerdicts, input.pageUrl, deps.getConfig);
      findings = applied.findings;
      passedScs = applied.passedScs;
      aiVerdicts.push(...audioVerdicts);
      aiBudget.calls += 1;
      aiBudget.images += 1;
      for (const review of audioVerdicts) {
        if (review.verdict === "Passed") resolved.set(review.sc, "Passed");
        else if (review.verdict === "Failed") resolved.set(review.sc, "Failed");
      }
      machine = computeConformance(scs, findings, passedScs, input.matchedScs, input.features);
    }
  }

  const conformance = finalizeConformance(machine, resolved);
  for (const row of conformance.rows) {
    if (row.result === "CannotTell") {
      row.reviewReason = cannotTellReason(row.num, aiVerdicts);
    }
  }
  return { conformance, findings, aiVerdicts, aiBudget };
}
