import type { ConformanceOutcome } from "@/lib/scoring";

export type ReviewStatus = "none" | "requested" | "in-review" | "reviewed";

// A reviewer judgement resolves a "Cannot tell" SC to one of these.
export type ReviewVerdict = "Passed" | "Failed" | "NotPresent";

export interface ReviewClaim {
  reviewerId: string;
  reviewerName: string;
  organization: string;
  claimedAt: string;
}

export interface ReviewResolution {
  scNum: string;
  verdict: ReviewVerdict;
  note?: string;
  reviewedBy: string;
  reviewedAt: string;
}

export interface ConformanceClaim {
  outcome: ConformanceOutcome;
  scsMet: number;
  scsApplicable: number;
  reviewer: string;
  organization: string;
  asAt: string;
  signedAt: string;
}

export class UnresolvedScsError extends Error {
  readonly unresolved: string[];
  constructor(unresolved: string[]) {
    super(`Unresolved success criteria: ${unresolved.join(", ")}`);
    this.name = "UnresolvedScsError";
    this.unresolved = unresolved;
  }
}

export class InvalidTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTransitionError";
  }
}

// --- State machine (reviewStatus transitions) ---

export function requestReview(status: ReviewStatus): ReviewStatus {
  if (status !== "none") throw new InvalidTransitionError("INVALID_TRANSITION");
  return "requested";
}

export function claimReview(
  status: ReviewStatus,
  claimedAt: string | null,
  staleAfterMs: number,
  now = Date.now(),
): ReviewStatus {
  if (status === "requested") return "in-review";
  if (status === "in-review") {
    if (claimedAt == null) return "in-review";
    const age = now - Date.parse(claimedAt);
    if (Number.isNaN(age) || age < 0 || age <= staleAfterMs) {
      throw new InvalidTransitionError("ALREADY_CLAIMED");
    }
    return "in-review"; // stale claim is reclaimable
  }
  throw new InvalidTransitionError("INVALID_TRANSITION");
}

// --- Resolution + conformance claim ---

export function unresolvedScs(
  rows: ReadonlyArray<{ num: string; result: string }>,
  resolutions: ReadonlySet<string>,
): string[] {
  return rows
    .filter((r) => r.result === "CannotTell" && !resolutions.has(r.num))
    .map((r) => r.num);
}

function computeOutcome(passed: number, failed: number, cannotTell: number): ConformanceOutcome {
  const scsApplicable = passed + failed + cannotTell;
  if (cannotTell > 0) return "undetermined";
  if (scsApplicable === 0) return "undetermined";
  if (failed > 0) return "does-not-conform";
  return "conforms";
}

export function buildConformanceClaim(input: {
  rows: ReadonlyArray<{ num: string; result: string }>;
  resolutions: ReadonlyMap<string, ReviewVerdict>;
  reviewer: string;
  organization: string;
  asAt: string;
  signedAt: string;
}): ConformanceClaim {
  const applied = input.rows.map((row) => {
    if (row.result === "CannotTell" && input.resolutions.has(row.num)) {
      return { ...row, result: input.resolutions.get(row.num)! };
    }
    return row;
  });

  const passed = applied.filter((r) => r.result === "Passed").length;
  const failed = applied.filter((r) => r.result === "Failed").length;
  const cannotTell = applied.filter((r) => r.result === "CannotTell").length;

  return {
    outcome: computeOutcome(passed, failed, cannotTell),
    scsMet: passed,
    scsApplicable: passed + failed + cannotTell,
    reviewer: input.reviewer,
    organization: input.organization,
    asAt: input.asAt,
    signedAt: input.signedAt,
  };
}

export function submitReview(input: {
  status: ReviewStatus;
  rows: ReadonlyArray<{ num: string; result: string }>;
  resolutions: ReadonlyMap<string, ReviewVerdict>;
  reviewer: string;
  organization: string;
  asAt: string;
  signedAt: string;
}): { status: "reviewed"; claim: ConformanceClaim } {
  if (input.status !== "in-review") {
    throw new InvalidTransitionError("INVALID_TRANSITION");
  }
  const unresolved = unresolvedScs(input.rows, new Set(input.resolutions.keys()));
  if (unresolved.length > 0) throw new UnresolvedScsError(unresolved);
  const claim = buildConformanceClaim(input);
  return { status: "reviewed", claim };
}
