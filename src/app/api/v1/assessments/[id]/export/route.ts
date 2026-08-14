import { NextResponse } from "next/server";
import { assessmentRepository } from "@/db/repository";
import { exportReport } from "@/lib/export";
import { exportFormatSchema } from "@/server/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
  const result = await exportReport(
    {
      url: assessment.url,
      standard: assessment.standard,
      score: assessment.score ?? 0,
      passBand: assessment.passBand ?? "fail",
      pagesScanned: assessment.pagesScanned,
      findings: findings.map((f) => ({
        ruleId: f.ruleId,
        impact: f.impact,
        description: f.description,
        pageUrl: f.pageUrl,
        elementCount: f.elementCount,
        recommendation: f.recommendation,
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
