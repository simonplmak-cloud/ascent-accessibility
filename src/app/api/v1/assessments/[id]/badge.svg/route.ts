import { NextResponse } from "next/server";
import { assessmentRepository } from "@/db/repository";
import { buildBadgeSvg } from "@/lib/export/badge";
import { assessmentIdSchema } from "@/server/validation";
import { logger } from "@/lib/observability/logger";

// The "Mark" — a verifiable badge for ESG reports and other materials. Green only
// when the report is human-verified; amber while it is an automated (partial)
// result, so the badge never overstates coverage. Links back to the public report.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!assessmentIdSchema.safeParse(id).success) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  try {
    const assessment = await assessmentRepository.findById(id);
    if (!assessment) {
      return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    }
    if (assessment.status !== "completed") {
      return NextResponse.json({ code: "CONFLICT", status: assessment.status }, { status: 409 });
    }

    const reviewed = assessment.reviewStatus === "reviewed";
    const svg = buildBadgeSvg({
      label: "accessibility",
      value: reviewed ? "verified ✓" : `${assessment.score ?? "—"} automated`,
      color: reviewed ? "#3fb950" : "#e3b341",
    });

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    logger.error({ err: error, assessmentId: id }, "badge export failed");
    return NextResponse.json(
      { code: "EXPORT_FAILED", message: "Badge generation failed. Please try again." },
      { status: 500 },
    );
  }
}
