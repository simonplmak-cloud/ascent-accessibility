import { NextResponse } from "next/server";
import { assessmentRepository } from "@/db/repository";
import { isReviewer } from "@/server/auth";

export async function GET() {
  if (!(await isReviewer())) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }
  const assessments = await assessmentRepository.listReviewQueue();
  return NextResponse.json({ assessments });
}
