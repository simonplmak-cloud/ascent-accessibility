import { getSc, type WcagLevel, type WcagSc } from "@/lib/standards/wcag-sc";
import type { PageFeatures } from "@/lib/standards/sc-applicability";
import { isScApplicable } from "@/lib/standards/sc-coverage";
import type { CannotTellReason } from "@/lib/standards/review-reason";

export type Impact = "critical" | "serious" | "moderate" | "minor";

// The conformance opinion: only issued when no applicable SC is "Cannot tell".
export type ConformanceOutcome = "conforms" | "does-not-conform" | "undetermined";

// Stage 4 — the machine verdict (deterministic rules + applicability).
export type MachineVerdict = "Passed" | "Failed" | "Unresolved" | "NotPresent";

// Stage 6 — the final verdict (machine + AI, folded per SC), in the W3C/WAI
// conformance-evaluation vocabulary.
export type FinalVerdict = "Passed" | "Failed" | "CannotTell" | "NotPresent";

// Provenance confidence for a resolved verdict.
export type VerdictConfidence = "confirmed" | "single-source";

export const FINAL_VERDICT_LABELS: Record<FinalVerdict, string> = {
  Passed: "Passed",
  Failed: "Failed",
  CannotTell: "Cannot tell",
  NotPresent: "Not present",
};

// Legacy (pre-rename) verdicts normalized to the official vocabulary on read.
export function normalizeFinalVerdict(value: string): FinalVerdict {
  switch (value) {
    case "Passed":
      return "Passed";
    case "Failed":
      return "Failed";
    case "CannotTell":
      return "CannotTell";
    case "NotPresent":
      return "NotPresent";
    case "compliant":
      return "Passed";
    case "violate":
      return "Failed";
    case "need-human-checking":
    case "needs-review":
      return "CannotTell";
    case "not-applicable":
      return "NotPresent";
    default:
      return "CannotTell";
  }
}

export function normalizeMachineVerdict(value: string): MachineVerdict {
  switch (value) {
    case "Passed":
      return "Passed";
    case "Failed":
      return "Failed";
    case "Unresolved":
      return "Unresolved";
    case "NotPresent":
      return "NotPresent";
    case "compliant":
      return "Passed";
    case "violate":
      return "Failed";
    case "need-checking":
      return "Unresolved";
    case "not-applicable":
      return "NotPresent";
    default:
      return "Unresolved";
  }
}

export interface MachineRow {
  num: string;
  title: string;
  level: WcagLevel;
  result: MachineVerdict;
}

export interface MachineConformanceResult {
  total: number;
  passed: number;
  failed: number;
  notPresent: number;
  unresolved: number;
  coverage: number;
  rows: MachineRow[];
}

export interface ScConformanceRow {
  num: string;
  title: string;
  level: WcagLevel;
  result: FinalVerdict;
  machineResult: MachineVerdict;
  reviewReason?: CannotTellReason;
  // Provenance: machine-decided rows are "confirmed" (deterministic); AI-resolved
  // rows are "single-source" (one model's judgment, not independently confirmed).
  confidence?: VerdictConfidence | undefined;
}

export interface ConformanceResult {
  total: number;
  passed: number;
  failed: number;
  notPresent: number;
  cannotTell: number;
  coverage: number;
  levelAttained: "A" | "AA" | "AAA" | "none";
  // Conformance opinion + counts (replaces the severity-weighted 0–100 score).
  outcome: ConformanceOutcome;
  scsMet: number;
  scsApplicable: number;
  rows: ScConformanceRow[];
}

const LEVEL_RANK: Record<WcagLevel, number> = { A: 1, AA: 2, AAA: 3 };

// Stage 4 — machine verdict per applicable SC.
export function computeConformance(
  scs: readonly WcagSc[],
  findings: readonly { wcagSc: string[] }[],
  passedScs: ReadonlySet<string>,
  matchedScs: ReadonlySet<string>,
  features: PageFeatures,
): MachineConformanceResult {
  const failed = new Set<string>();
  for (const finding of findings) {
    for (const sc of finding.wcagSc) {
      if (getSc(sc)) failed.add(sc);
    }
  }

  const rows: MachineRow[] = scs.map((sc) => {
    let result: MachineVerdict;
    if (failed.has(sc.num)) result = "Failed";
    else if (passedScs.has(sc.num)) result = "Passed";
    else if (isScApplicable(sc.num, matchedScs, features) === "not-applicable") {
      result = "NotPresent";
    } else {
      result = "Unresolved";
    }
    return { num: sc.num, title: sc.title, level: sc.level, result };
  });

  const passed = rows.filter((r) => r.result === "Passed").length;
  const failedCount = rows.filter((r) => r.result === "Failed").length;
  const notPresent = rows.filter((r) => r.result === "NotPresent").length;
  const unresolved = rows.filter((r) => r.result === "Unresolved").length;
  const tested = passed + failedCount;
  const coverage = scs.length === 0 ? 0 : Math.round((tested / scs.length) * 100);

  return { total: scs.length, passed, failed: failedCount, notPresent, unresolved, coverage, rows };
}

// Stage 6 — fold AI verdicts into the final verdict per SC.
export function finalizeConformance(
  machine: MachineConformanceResult,
  resolved: ReadonlyMap<string, "Passed" | "Failed">,
): ConformanceResult {
  const rows: ScConformanceRow[] = machine.rows.map((row) => {
    let result: FinalVerdict;
    let confidence: VerdictConfidence | undefined;
    if (row.result === "Unresolved") {
      const resolvedVerdict = resolved.get(row.num);
      if (resolvedVerdict) {
        result = resolvedVerdict;
        confidence = "single-source";
      } else {
        result = "CannotTell";
      }
    } else {
      result = row.result;
      confidence = "confirmed";
    }
    return {
      num: row.num,
      title: row.title,
      level: row.level,
      result,
      machineResult: row.result,
      ...(confidence ? { confidence } : {}),
    };
  });

  const passed = rows.filter((r) => r.result === "Passed").length;
  const failed = rows.filter((r) => r.result === "Failed").length;
  const notPresent = rows.filter((r) => r.result === "NotPresent").length;
  const cannotTell = rows.filter((r) => r.result === "CannotTell").length;
  const tested = passed + failed;
  const coverage = rows.length === 0 ? 0 : Math.round((tested / rows.length) * 100);

  let levelAttained: ConformanceResult["levelAttained"] = "none";
  const maxRank = rows.reduce((m, r) => Math.max(m, LEVEL_RANK[r.level]), 0);
  for (const level of ["A", "AA", "AAA"] as const) {
    if (LEVEL_RANK[level] > maxRank) break;
    const relevant = rows.filter((r) => LEVEL_RANK[r.level] <= LEVEL_RANK[level]);
    const hasFailed = relevant.some((r) => r.result === "Failed");
    const hasReview = relevant.some((r) => r.result === "CannotTell");
    if (!hasFailed && !hasReview) levelAttained = level;
  }

  const scsApplicable = passed + failed + cannotTell;
  const scsMet = passed;
  const outcome: ConformanceOutcome =
    cannotTell > 0
      ? "undetermined"
      : scsApplicable === 0
        ? "undetermined"
        : failed > 0
          ? "does-not-conform"
          : "conforms";

  return {
    total: rows.length,
    passed,
    failed,
    notPresent,
    cannotTell,
    coverage,
    levelAttained,
    outcome,
    scsMet,
    scsApplicable,
    rows,
  };
}
