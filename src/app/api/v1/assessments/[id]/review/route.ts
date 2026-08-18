import { NextResponse } from "next/server";
import { assessmentRepository } from "@/db/repository";
import { assessmentIdSchema } from "@/server/validation";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!assessmentIdSchema.safeParse(id).success) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const ok = await assessmentRepository.requestReview(id);
  if (!ok) {
    return NextResponse.json({ code: "REVIEW_ALREADY_REQUESTED" }, { status: 409 });
  }
  return NextResponse.json({ reviewStatus: "requested" });
}
