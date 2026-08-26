import { NextResponse } from "next/server";
import { assessmentRepository } from "@/db/repository";
import { getSessionUser, isReviewer } from "@/server/auth";
import { assessmentIdSchema } from "@/server/validation";

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
  const body = (await req.json().catch(() => ({}))) as {
    organization?: unknown;
  };
  const organization = typeof body.organization === "string" ? body.organization : "";
  const claimedAt = new Date().toISOString();

  const ok = await assessmentRepository.claimReview(id, {
    reviewerId: user?.id ?? "",
    reviewerName: user?.name ?? user?.email ?? "",
    organization,
    claimedAt,
  });
  if (!ok) {
    return NextResponse.json({ code: "ALREADY_CLAIMED" }, { status: 409 });
  }
  return NextResponse.json({
    reviewClaim: { reviewerId: user?.id, reviewerName: user?.name, organization, claimedAt },
  });
}
