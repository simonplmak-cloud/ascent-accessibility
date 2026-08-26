import { assessmentRepository } from "@/db/repository";
import {
  InvalidTransitionError,
  submitReview,
  UnresolvedScsError,
  type ConformanceClaim,
  type ReviewStatus,
  type ReviewVerdict,
} from "@/lib/review";

interface ConformanceRowInput {
  num: string;
  result: string;
}

export interface ResolutionInput {
  verdict?: string;
  note?: string;
}

export type ResolveResult =
  | { ok: true; claim: ConformanceClaim }
  | { ok: false; code: "NOT_FOUND" | "UNRESOLVED_SCS" | "INVALID_TRANSITION"; unresolved?: string[] };

// Resolve one assessment's Cannot-tell SCs (reuses src/lib/review's state machine
// + unresolved/transition guards) and persist the conformance claim.
export async function resolveAssessmentReview(
  id: string,
  rawResolutions: Record<string, ResolutionInput>,
  reviewedBy: string,
): Promise<ResolveResult> {
  const assessment = await assessmentRepository.findById(id);
  if (!assessment) return { ok: false, code: "NOT_FOUND" };

  const comparison = await assessmentRepository.findComparison<{
    conformance?: { rows?: ConformanceRowInput[] };
  }>(id);
  const rows = comparison?.conformance?.rows ?? [];

  const reviewedAt = new Date().toISOString();
  const claim = (() => {
    try {
      return JSON.parse(assessment.reviewClaim ?? "{}") as { organization?: string };
    } catch {
      return {};
    }
  })();

  const resolutions = new Map<string, ReviewVerdict>();
  for (const [scNum, r] of Object.entries(rawResolutions)) {
    if (r?.verdict === "Passed" || r?.verdict === "Failed" || r?.verdict === "NotPresent") {
      resolutions.set(scNum, r.verdict);
    }
  }

  let result;
  try {
    result = submitReview({
      status: (assessment.reviewStatus as ReviewStatus) ?? "none",
      rows: rows.map((r) => ({ num: r.num, result: r.result })),
      resolutions,
      reviewer: reviewedBy,
      organization: claim.organization ?? "",
      asAt: assessment.snapshotAt ?? assessment.updatedAt,
      signedAt: reviewedAt,
    });
  } catch (error) {
    if (error instanceof UnresolvedScsError) {
      return { ok: false, code: "UNRESOLVED_SCS", unresolved: error.unresolved };
    }
    if (error instanceof InvalidTransitionError) {
      return { ok: false, code: "INVALID_TRANSITION" };
    }
    throw error;
  }

  const reviewResults: Record<string, unknown> = {};
  for (const [scNum, verdict] of resolutions) {
    reviewResults[scNum] = {
      verdict,
      note: rawResolutions[scNum]?.note ?? "",
      reviewedBy,
      reviewedAt,
      source: "human",
    };
  }

  await assessmentRepository.submitReview(id, {
    reviewResults: JSON.stringify(reviewResults),
    conformance: result.claim.outcome,
    scsMet: result.claim.scsMet,
    scsApplicable: result.claim.scsApplicable,
  });

  return { ok: true, claim: result.claim };
}
