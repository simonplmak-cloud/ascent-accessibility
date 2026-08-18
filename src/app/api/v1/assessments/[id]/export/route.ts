import { NextResponse } from "next/server";
import { assessmentRepository } from "@/db/repository";
import { exportReport, type ReportComparison } from "@/lib/export";
import { assessmentIdSchema, exportFormatSchema } from "@/server/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!assessmentIdSchema.safeParse(id).success) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }
  const format = exportFormatSchema.safeParse(
    new URL(req.url).searchParams.get("format"),
  );
  if (!format.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const assessment = await assessmentRepository.findById(id);
  if (!assessment) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }
  if (assessment.status !== "completed") {
    return NextResponse.json(
      { code: "CONFLICT", status: assessment.status },
      { status: 409 },
    );
  }

  const findings = await assessmentRepository.findFindings(id);
  const comparison = await assessmentRepository.findComparison<ReportComparison>(id);
  const result = await exportReport(
    {
      url: assessment.url,
      standard: assessment.standard,
      outcome: assessment.conformance ?? "undetermined",
      scsMet: assessment.scsMet ?? 0,
      scsApplicable: assessment.scsApplicable ?? 0,
      pagesScanned: assessment.pagesScanned,
      generatedAt: assessment.updatedAt,
      comparison: comparison ?? undefined,
      findings: findings.map((f) => ({
        ruleId: f.ruleId,
        impact: f.impact,
        description: f.description,
        pageUrl: f.pageUrl,
        elementCount: f.elementCount,
        recommendation: f.recommendation,
        wcagSc: f.wcagSc,
        scTitle: f.scTitle,
        confidence: f.confidence,
        sources: f.sources.map((s) => s.tool),
      })),
    },
    format.data,
  );

  return new NextResponse(new Uint8Array(result.body), {
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `attachment; filename="assessment-${id}.${format.data}"`,
    },
  });
}
