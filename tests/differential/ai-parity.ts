import type { VisionModel, AiReview } from "@/lib/ai-review/types";
import { runTriage, type GetConfig } from "@/lib/ai-review/triage";

// Golden-set evaluation for the per-rule AI review. Compares AI verdicts against
// a human-labeled oracle and enforces the AC-19 / AC-E6 gate:
//   precision >= 0.8, false-"pass" = 0, false-"needs-review" <= 0.4.
// A rule below the gate must not ship (and a change must not regress it).

export type AiParityVerdict = "pass" | "fail" | "needs-review";

export interface LabeledVerdict {
  sc: string;
  verdict: AiParityVerdict;
}

export interface GoldenLabel {
  sc: string;
  oracle: AiParityVerdict;
}

export interface GoldenImage {
  id: string;
  image: Buffer;
  labels: GoldenLabel[];
}

export const AI_PARITY_GATE = {
  precision: 0.8,
  falsePass: 0,
  falseNeedsReview: 0.4,
} as const;

export interface ScParityMetrics {
  sc: string;
  n: number;
  tp: number;
  fp: number;
  fn: number;
  falsePass: number;
  falseNeedsReview: number;
  precision: number;
  recall: number;
  falsePassRate: number;
  falseNeedsReviewRate: number;
  gatePassed: boolean;
  gateFailures: string[];
}

export interface AiParityReport {
  perSc: ScParityMetrics[];
  gatePassed: boolean;
  failures: string[];
}

function metricsFor(sc: string, ai: AiParityVerdict[], oracle: AiParityVerdict[]): ScParityMetrics {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let falsePass = 0;
  let falseNeedsReview = 0;
  let oracleFail = 0;
  let oracleDecided = 0;

  for (let i = 0; i < oracle.length; i++) {
    const a = ai[i] ?? "needs-review";
    const o = oracle[i];
    if (o === "fail") {
      oracleFail += 1;
      oracleDecided += 1;
      if (a === "fail") tp += 1;
      else {
        fn += 1;
        if (a === "pass") falsePass += 1;
        if (a === "needs-review") falseNeedsReview += 1;
      }
    } else if (o === "pass") {
      oracleDecided += 1;
      if (a === "fail") fp += 1;
      else if (a === "needs-review") falseNeedsReview += 1;
    } else if (a === "fail") {
      fp += 1;
    }
  }

  const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
  const recall = oracleFail === 0 ? 1 : tp / oracleFail;
  const falsePassRate = oracleFail === 0 ? 0 : falsePass / oracleFail;
  const falseNeedsReviewRate = oracleDecided === 0 ? 0 : falseNeedsReview / oracleDecided;

  const gateFailures: string[] = [];
  if (precision < AI_PARITY_GATE.precision) {
    gateFailures.push(`precision ${precision.toFixed(2)} < ${AI_PARITY_GATE.precision}`);
  }
  if (falsePass > AI_PARITY_GATE.falsePass) {
    gateFailures.push(`false-pass ${falsePass} > ${AI_PARITY_GATE.falsePass}`);
  }
  if (falseNeedsReviewRate > AI_PARITY_GATE.falseNeedsReview) {
    gateFailures.push(
      `false-needs-review ${falseNeedsReviewRate.toFixed(2)} > ${AI_PARITY_GATE.falseNeedsReview}`,
    );
  }

  return {
    sc,
    n: oracle.length,
    tp,
    fp,
    fn,
    falsePass,
    falseNeedsReview,
    precision,
    recall,
    falsePassRate,
    falseNeedsReviewRate,
    gatePassed: gateFailures.length === 0,
    gateFailures,
  };
}

// `ai` and `oracle` are aligned by position (one entry per labeled example);
// the oracle's SC is authoritative.
export function computeAiParity(ai: LabeledVerdict[], oracle: LabeledVerdict[]): AiParityReport {
  const bySc = new Map<string, { ai: AiParityVerdict[]; oracle: AiParityVerdict[] }>();
  for (let i = 0; i < oracle.length; i++) {
    const sc = oracle[i]!.sc;
    const group = bySc.get(sc) ?? { ai: [], oracle: [] };
    group.ai.push(ai[i]?.verdict ?? "needs-review");
    group.oracle.push(oracle[i]!.verdict);
    bySc.set(sc, group);
  }

  const perSc = [...bySc.entries()]
    .map(([sc, g]) => metricsFor(sc, g.ai, g.oracle))
    .sort((a, b) => a.sc.localeCompare(b.sc));
  const failures = perSc.filter((m) => !m.gatePassed).map((m) => m.sc);
  return { perSc, gatePassed: failures.length === 0, failures };
}

function reviewToParity(verdict?: "Passed" | "Failed" | "NotTested"): AiParityVerdict {
  if (verdict === "Passed") return "pass";
  if (verdict === "Failed") return "fail";
  return "needs-review";
}

// Harness: run the per-criterion triage over a labeled screenshot set and report
// the parity + gate. Screenshots are passed in-memory (the repo does not commit
// binary screenshots); `golden-set/` holds the labels.
export async function runAiParityEval(opts: {
  model: VisionModel;
  images: GoldenImage[];
  getConfig?: GetConfig;
}): Promise<AiParityReport> {
  const ai: LabeledVerdict[] = [];
  const oracle: LabeledVerdict[] = [];

  for (const img of opts.images) {
    const triage = await runTriage({
      model: opts.model,
      image: img.image,
      unresolvedScs: img.labels.map((l) => l.sc),
      ...(opts.getConfig !== undefined ? { getConfig: opts.getConfig } : {}),
    });
    const bySc = new Map<string, AiReview>();
    for (const r of triage.reviews) bySc.set(r.sc, r);
    for (const label of img.labels) {
      ai.push({ sc: label.sc, verdict: reviewToParity(bySc.get(label.sc)?.verdict) });
      oracle.push({ sc: label.sc, verdict: label.oracle });
    }
  }

  return computeAiParity(ai, oracle);
}
