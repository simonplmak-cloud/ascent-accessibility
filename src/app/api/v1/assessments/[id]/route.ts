import { NextResponse } from "next/server";
import { assessmentRepository } from "@/db/repository";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const assessment = await assessmentRepository.findById(id);
  if (!assessment) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const findings =
    assessment.status === "completed"
      ? await assessmentRepository.findFindings(id)
      : [];

  return NextResponse.json({
    id: assessment.id,
    status: assessment.status,
    partial: assessment.partial,
    url: assessment.url,
    standard: assessment.standard,
    score: assessment.score,
    passBand: assessment.passBand,
    pagesScanned: assessment.pagesScanned,
    findings: findings.map((f) => ({
      ruleId: f.ruleId,
      impact: f.impact,
      description: f.description,
      pageUrl: f.pageUrl,
      elementCount: f.elementCount,
      recommendation: f.recommendation,
    })),
  });
}
