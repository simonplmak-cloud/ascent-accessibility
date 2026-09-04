import { NextResponse } from "next/server";
import { buildAcrHtml, acrIdentity } from "@/lib/export/acr";
import { loadReportData } from "@/lib/export/load-report";
import { assessmentRepository } from "@/db/repository";
import { assessmentIdSchema } from "@/server/validation";
import { BRANDING } from "@/lib/site/branding";
import { logger } from "@/lib/observability/logger";

// ACR (VPAT-structured) generated from the per-criterion conformance data.
// Drafts are clearly labelled as partial / not-independently-verified; a
// completed human review produces a signed ACR with the reviewer's identity and
// evaluation methods. Both are honest about coverage.
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

    const { report } = await loadReportData(id);
    const conformance = report.comparison?.conformance;
    if (!conformance?.rows?.length) {
      return NextResponse.json(
        { code: "ACR_NOT_AVAILABLE", message: "No conformance data is available for this assessment yet." },
        { status: 404 },
      );
    }

    const reviewed = report.reviewStatus === "reviewed";
    const identity = acrIdentity(report.reviewClaim, reviewed);
    const evaluator = identity.reviewerName
      ? [identity.reviewerName, identity.organization].filter(Boolean).join(" — ")
      : "Ascent Accessibility automated engine (no human evaluator)";

    const html = buildAcrHtml({
      url: report.url,
      standard: report.standard,
      date: new Date(report.generatedAt ?? Date.now()).toUTCString(),
      productName: productName(report.url),
      productVersion: `N/A — website, as assessed ${new Date(report.snapshotAt ?? report.generatedAt ?? Date.now()).toUTCString()}`,
      evaluator,
      contact: identity.email || BRANDING.email,
      evaluationMethods: report.reviewClaim?.evaluationMethods ?? [
        "Automated rule engine + AI-assisted review",
        "Headless Chromium (remote CDP)",
        "No assistive technology tested yet",
      ],
      notes: [
        `Pages were discovered by sitemap.xml and link crawl (crawl coverage, not WCAG-EM representative sampling).`,
        report.partial ? "Crawl limits reached — this covers a subset of pages." : "Full crawl completed.",
      ],
      reviewed,
      coverage: conformance.coverage,
      total: conformance.total,
      passed: conformance.passed,
      failed: conformance.failed,
      cannotTell: conformance.cannotTell,
      rows: conformance.rows,
      reviewResults: report.reviewResults,
      findings: report.findings,
    });

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="acr${reviewed ? "" : "-draft"}-${id}.html"`,
      },
    });
  } catch (error) {
    logger.error({ err: error, assessmentId: id }, "ACR export failed");
    return NextResponse.json(
      { code: "EXPORT_FAILED", message: "ACR export failed. Please try again." },
      { status: 500 },
    );
  }
}

function productName(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
