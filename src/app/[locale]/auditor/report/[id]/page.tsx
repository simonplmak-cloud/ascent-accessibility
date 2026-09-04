import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { assessmentRepository } from "@/db/repository";
import { standardName } from "@/lib/standards/standards-locales";
import { parseDetectedLanguages } from "@/lib/standards/language-detect";
import { Report } from "@/components/assessment/report";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import type { AssessmentResult, ComparisonData } from "@/components/assessment/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reportPage" });
  return { title: t("title") };
}

export default async function ShareableReportPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reportPage");
  const assessmentId = decodeURIComponent(id);
  const assessment = await assessmentRepository.findById(assessmentId);
  if (!assessment) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-terminal-fg">
          {t("notFound")}
        </h1>
        <p className="mt-2 font-sans text-sm text-terminal-muted">
          {t("notFoundBody")}
        </p>
        <p className="mt-4">
          <Link
            href="/auditor"
            className="font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
          >
            {t("backToWorkspace")}
          </Link>
        </p>
      </div>
    );
  }

  if (assessment.status !== "completed") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-terminal-fg">
          {t("title")}: {assessment.status}
        </h1>
        <p className="mt-2 font-sans text-sm text-terminal-muted">
          {assessment.status === "queued" && t("statusQueued")}
          {assessment.status === "running" && t("statusRunning")}
          {assessment.status === "failed" && t("statusFailed")}
          {assessment.status === "blocked" && t("statusBlocked")}
        </p>
        <p className="mt-4">
          <Link
            href="/auditor"
            className="font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
          >
            {t("backToWorkspace")}
          </Link>
        </p>
      </div>
    );
  }

  const findings = await assessmentRepository.findFindings(assessmentId);
  const log = await assessmentRepository.readLog(assessmentId);
  const comparison = await assessmentRepository.findComparison<ComparisonData>(assessmentId);

  const result: AssessmentResult = {
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
    findings: findings as AssessmentResult["findings"],
    comparison: comparison ?? undefined,
    detectedLanguages: parseDetectedLanguages(assessment.detectedLanguages),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Breadcrumbs
        trail={[{ href: "/auditor", label: t("breadcrumbWorkspace") }, { label: t("breadcrumbReport") }]}
      />
      <h1 className="mt-4 font-display text-xl font-bold text-terminal-fg">
        <a
          href={assessment.url}
          className="underline-offset-4 hover:underline"
          target="_blank"
          rel="noreferrer"
          aria-label={t("opensNewWindow", { url: assessment.url })}
        >
          {assessment.url}
        </a>
      </h1>
      <p className="mt-2 font-sans text-sm text-terminal-muted">
        {assessment.standardLabel ?? standardName(assessment.standard, locale)} · {assessment.depth === 0 ? t("singlePage") : t("wholeSite")}
      </p>
      <Report result={result} />
    </div>
  );
}
