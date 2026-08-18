import { NextResponse } from "next/server";
import { assessmentRepository } from "@/db/repository";
import { assessmentIdSchema } from "@/server/validation";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!assessmentIdSchema.safeParse(id).success) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }
  const assessment = await assessmentRepository.findById(id);
  if (!assessment) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const findings =
    assessment.status === "completed"
      ? await assessmentRepository.findFindings(id)
      : [];
  const log = await assessmentRepository.readLog(id);
  const comparison = await assessmentRepository.findComparison(id);

  return NextResponse.json({
    id: assessment.id,
    status: assessment.status,
    partial: assessment.partial,
    url: assessment.url,
    standard: assessment.standard,
    score: assessment.score,
    passBand: assessment.passBand,
    conformance: assessment.conformance,
    scsMet: assessment.scsMet,
    scsApplicable: assessment.scsApplicable,
    reviewStatus: assessment.reviewStatus,
    snapshotAt: assessment.snapshotAt,
    pagesScanned: assessment.pagesScanned,
    log,
    comparison,
    findings,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!assessmentIdSchema.safeParse(id).success) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }
  const deleted = await assessmentRepository.delete(id);
  if (!deleted) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
