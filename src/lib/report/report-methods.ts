// Transparent three-way results (machine / AI / human review) + a combined result.
// Pure, deterministic derivations from the conformance rows + AI verdicts — the
// same logic drives both the web UI report and the PDF report.

export { cannotTellReason, type CannotTellReason, type AiVerdictLike } from "@/lib/standards/review-reason";

export interface MethodRow {
  num: string;
  title: string;
  level: string;
  result: string;
  machineResult?: string;
}

export interface AiVerdict {
  sc: string;
  verdict: string;
  confidence: number;
  reasoning: string;
}

// Machine review: SCs the rule engine decided (a substantive pass/fail verdict).
// "NotPresent" (no relevant content) and "Unresolved" (couldn't decide) are not
// substantive machine verdicts — the former is counted in the combined summary,
// the latter is where AI/human review take over.
export function machineResults(rows: MethodRow[]): {
  passed: number;
  failed: number;
  rows: MethodRow[];
} {
  const decided = rows.filter(
    (r) => r.machineResult === "Passed" || r.machineResult === "Failed",
  );
  return {
    passed: decided.filter((r) => r.machineResult === "Passed").length,
    failed: decided.filter((r) => r.machineResult === "Failed").length,
    rows: decided,
  };
}

// AI-assisted review: what the AI concluded per SC it attempted (pass/fail/
// cannot-tell + confidence + reasoning). AI "cannot tell" escalates to human review.
export function aiResults(verdicts: AiVerdict[]): {
  passed: number;
  failed: number;
  cannotTell: number;
  verdicts: AiVerdict[];
} {
  return {
    passed: verdicts.filter((v) => v.verdict === "Passed").length,
    failed: verdicts.filter((v) => v.verdict === "Failed").length,
    cannotTell: verdicts.filter((v) => v.verdict === "CannotTell").length,
    verdicts,
  };
}

// Human review (pending): SCs that still need human judgement (result CannotTell).
export function humanReviewPending(rows: MethodRow[]): {
  count: number;
  rows: MethodRow[];
} {
  const pending = rows.filter((r) => r.result === "CannotTell");
  return { count: pending.length, rows: pending };
}

// Combined result: the merged outcome across all methods.
export function combinedSummary(conformance: {
  total: number;
  passed: number;
  failed: number;
  notPresent: number;
  cannotTell: number;
  coverage: number;
  levelAttained: string;
  outcome: string;
}): {
  total: number;
  passed: number;
  failed: number;
  notPresent: number;
  cannotTell: number;
  coverage: number;
  levelAttained: string;
  outcome: string;
} {
  return { ...conformance };
}
