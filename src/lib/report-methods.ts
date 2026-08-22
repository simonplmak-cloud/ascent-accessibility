import type { ComparisonData, Conformance, ConformanceRow } from "@/components/assessment/types";

// Transparency: split the combined conformance result into the three review
// methods — machine (rule engine), AI-assisted, and human review — plus a
// combined summary. All pure and deterministic (mission-critical reliability).

export interface MethodGroup {
  passed: number;
  failed: number;
  rows: ConformanceRow[];
}

// Machine review: SCs the rule engine decided on its own (no AI needed).
export function machineResults(rows: ConformanceRow[]): MethodGroup {
  const decided = rows.filter(
    (r) => r.machineResult === "Passed" || r.machineResult === "Failed",
  );
  return {
    passed: decided.filter((r) => r.machineResult === "Passed").length,
    failed: decided.filter((r) => r.machineResult === "Failed").length,
    rows: decided,
  };
}

type AiVerdicts = NonNullable<ComparisonData["ai"]>["verdicts"];

export interface AiReviewGroup {
  passed: number;
  failed: number;
  cannotTell: number;
  verdicts: AiVerdicts;
}

// AI-assisted review: the SCs the AI attempted, with its verdict + confidence.
export function aiResults(ai: ComparisonData["ai"]): AiReviewGroup | null {
  if (!ai) return null;
  const verdicts = ai.verdicts ?? [];
  return {
    passed: verdicts.filter((v) => v.verdict === "Passed").length,
    failed: verdicts.filter((v) => v.verdict === "Failed").length,
    cannotTell: verdicts.filter((v) => v.verdict === "CannotTell").length,
    verdicts,
  };
}

// Human review: SCs that still need human judgement (final result = CannotTell).
export function humanReviewPending(rows: ConformanceRow[]): { count: number; rows: ConformanceRow[] } {
  const pending = rows.filter((r) => r.result === "CannotTell");
  return { count: pending.length, rows: pending };
}

// Combined result: the merged outcome across all methods.
export function combinedSummary(conformance: Conformance) {
  return {
    outcome: conformance.outcome,
    passed: conformance.passed,
    failed: conformance.failed,
    cannotTell: conformance.cannotTell,
    notPresent: conformance.notPresent,
    coverage: conformance.coverage,
    levelAttained: conformance.levelAttained,
    scsMet: conformance.scsMet,
    scsApplicable: conformance.scsApplicable,
  };
}
