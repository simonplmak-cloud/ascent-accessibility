import {
  computeConformance,
  finalizeConformance,
  type ConformanceResult,
} from "@/lib/scoring";
import type { PageFeatures } from "@/lib/standards/sc-applicability";
import { scsForStandard } from "@/lib/standards/version";
import { naturesOf } from "@/lib/standards/nature";
import type { WcagLevel } from "@/lib/standards/wcag-sc";
import type { AiBudget, AiReview, VisionModel } from "@/lib/ai-review/types";
import { applyAiVerdicts, runTriage } from "@/lib/ai-review/triage";
import type { Finding } from "@/db/schema";

export interface EvaluateInput {
  version: string;
  level: WcagLevel;
  findings: Finding[];
  passedScs: ReadonlySet<string>;
  features: PageFeatures;
  pageUrl: string;
}

export interface EvaluateDeps {
  visionModel?: VisionModel;
  aiScreenshot?: Buffer | null;
  incompleteContext?: string[];
  aiEnabled?: boolean;
  threshold?: number;
}

export interface EvaluateOutput {
  conformance: ConformanceResult;
  findings: Finding[];
  aiVerdicts: AiReview[];
  aiBudget: AiBudget;
}

function isManualOnly(sc: string): boolean {
  const natures = naturesOf(sc);
  return natures.size === 1 && natures.has("manual-only");
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

  let machine = computeConformance(scs, findings, passedScs, input.features);

  if (deps.aiEnabled && deps.visionModel && deps.aiScreenshot) {
    const eligible = machine.rows
      .filter((row) => row.result === "Unresolved")
      .filter((row) => !isManualOnly(row.num))
      .map((row) => row.num);

    if (eligible.length > 0) {
      const triage = await runTriage({
        model: deps.visionModel,
        image: deps.aiScreenshot,
        unresolvedScs: eligible,
        incompleteContext: deps.incompleteContext ?? [],
        threshold: deps.threshold,
      });
      aiBudget.calls += triage.budget.calls;
      aiBudget.images += triage.budget.images;
      aiVerdicts.push(...triage.reviews);

      const applied = applyAiVerdicts(findings, passedScs, triage.reviews, input.pageUrl);
      findings = applied.findings;
      passedScs = applied.passedScs;

      for (const review of triage.reviews) {
        if (review.verdict === "Passed") resolved.set(review.sc, "Passed");
        else if (review.verdict === "Failed") resolved.set(review.sc, "Failed");
      }

      machine = computeConformance(scs, findings, passedScs, input.features);
    }
  }

  const conformance = finalizeConformance(machine, resolved);
  return { conformance, findings, aiVerdicts, aiBudget };
}
