import { NextResponse } from "next/server";
import { assessmentRepository } from "@/db/repository";
import { generateVpat, type VpatEdition } from "@/lib/export/vpat";
import { assessmentIdSchema } from "@/server/validation";

interface ConformanceRowInput {
  num: string;
  title?: string;
  result: string;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!assessmentIdSchema.safeParse(id).success) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const editionParam = new URL(req.url).searchParams.get("edition") ?? "wcag";
  const edition: VpatEdition =
    editionParam === "508" || editionParam === "eu" ? editionParam : "wcag";

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

  const comparison = await assessmentRepository.findComparison<{
    conformance?: { rows?: ConformanceRowInput[] };
  }>(id);
  const rows = comparison?.conformance?.rows ?? [];

  const doc = generateVpat({
    edition,
    rows: rows.map((r) => ({
      criterion: r.num,
      title: r.title ?? r.num,
      verdict: r.result,
    })),
  });

  return NextResponse.json({
    assessmentId: id,
    url: assessment.url,
    standard: assessment.standard,
    asAt: assessment.snapshotAt ?? assessment.updatedAt,
    ...doc,
  });
}
