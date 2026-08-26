import { NextResponse } from "next/server";
import { getSessionUser, isReviewer } from "@/server/auth";
import { assessmentIdSchema } from "@/server/validation";
import { resolveAssessmentReview } from "@/server/review";

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
    resolutions?: Record<string, { verdict?: string; note?: string }>;
  };

  const result = await resolveAssessmentReview(id, body.resolutions ?? {}, user?.email ?? "");

  if (!result.ok) {
    if (result.code === "UNRESOLVED_SCS") {
      return NextResponse.json(
        { code: "UNRESOLVED_SCS", unresolved: result.unresolved },
        { status: 422 },
      );
    }
    if (result.code === "INVALID_TRANSITION") {
      return NextResponse.json({ code: "INVALID_TRANSITION" }, { status: 409 });
    }
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json(result.claim);
}
