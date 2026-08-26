import { NextResponse } from "next/server";
import { assessmentRepository } from "@/db/repository";
import { buildAcrHtml } from "@/lib/export/acr";
import { assessmentIdSchema } from "@/server/validation";
import type { ComparisonData } from "@/components/assessment/types";

// Draft ACR (VPAT-structured) generated from the automated per-criterion data.
// Clearly labelled as a partial, not-independently-verified draft — it gives a
// user without human review something credible to show, honestly marked.
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
  if (assessment.status !== "completed") {
    return NextResponse.json({ code: "CONFLICT", status: assessment.status }, { status: 409 });
  }

  const comparison = await assessmentRepository.findComparison<ComparisonData>(id);
  const conformance = comparison?.conformance;
  if (!conformance?.rows?.length) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const html = buildAcrHtml({
    url: assessment.url,
    standard: assessment.standard,
    date: new Date(assessment.updatedAt).toUTCString(),
    coverage: conformance.coverage,
    total: conformance.total,
    passed: conformance.passed,
    failed: conformance.failed,
    cannotTell: conformance.cannotTell,
    rows: conformance.rows,
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="acr-draft-${id}.html"`,
    },
  });
}
