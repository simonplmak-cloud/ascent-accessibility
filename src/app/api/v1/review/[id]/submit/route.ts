import { NextResponse } from "next/server";
import { assessmentRepository } from "@/db/repository";
import { getSessionUser, isReviewer } from "@/server/auth";
import { assessmentIdSchema } from "@/server/validation";
import {
  InvalidTransitionError,
  submitReview,
  UnresolvedScsError,
  type ReviewVerdict,
} from "@/lib/review";

interface ConformanceRowInput {
  num: string;
  result: string;
}

interface ResolutionBody {
  scNum?: never;
  verdict?: string;
  note?: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!assessmentIdSchema.safeParse(id).success) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }
  if (!(await isReviewer())) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  const user = await getSessionUser();
  const assessment = await assessmentRepository.findById(id);
  if (!assessment) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const comparison = await assessmentRepository.findComparison<{
    conformance?: { rows?: ConformanceRowInput[] };
  }>(id);
  const rows = comparison?.conformance?.rows ?? [];

  const body = (await req.json().catch(() => ({}))) as {
    resolutions?: Record<string, ResolutionBody>;
  };
  const rawResolutions = body.resolutions ?? {};

  const reviewedBy = user?.email ?? "";
  const reviewedAt = new Date().toISOString();
  const claim = (() => {
    try {
      return JSON.parse(assessment.reviewClaim ?? "{}") as {
        organization?: string;
      };
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
      status: (assessment.reviewStatus as Parameters<typeof submitReview>[0]["status"]) ?? "none",
      rows: rows.map((r) => ({ num: r.num, result: r.result })),
      resolutions,
      reviewer: reviewedBy,
      organization: claim.organization ?? "",
      asAt: assessment.snapshotAt ?? assessment.updatedAt,
      signedAt: reviewedAt,
    });
  } catch (error) {
    if (error instanceof UnresolvedScsError) {
      return NextResponse.json(
        { code: "UNRESOLVED_SCS", unresolved: error.unresolved },
        { status: 422 },
      );
    }
    if (error instanceof InvalidTransitionError) {
      return NextResponse.json({ code: "INVALID_TRANSITION" }, { status: 409 });
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
    };
  }

  await assessmentRepository.submitReview(id, {
    reviewResults: JSON.stringify(reviewResults),
    conformance: result.claim.outcome,
    scsMet: result.claim.scsMet,
    scsApplicable: result.claim.scsApplicable,
  });

  return NextResponse.json(result.claim);
}
