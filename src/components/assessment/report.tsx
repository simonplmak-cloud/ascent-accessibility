"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ScoreSummary } from "./score-summary";
import { ConformanceTable } from "./conformance-table";
import { ReviewMethods } from "./review-methods";
import { ComparisonPanel } from "./comparison-panel";
import { FindingEvidence } from "./finding-evidence";
import { Methodology } from "./methodology";
import { LogPanel } from "./log-panel";
import { ReportMark } from "./report-mark";
import { buildReportSummary } from "@/lib/report-summary";
import { priorityFindings } from "@/lib/report-priority";
import { impactColor } from "./severity";
import { impactLabel } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import type { AssessmentResult } from "./types";

export function Report({ result }: { result: AssessmentResult }) {
  const t = useTranslations("report");
  const locale = useLocale();
  const [largePrint, setLargePrint] = useState(false);

  const hasConformance = Boolean(result.comparison?.conformance);
  const hasAnalysis = Boolean(result.comparison);

  // Partial completion (Phase 2): the report is partial unless human review is done.
  // Human review is coming soon, so today every report is partial — mark it honestly.
  const conformance = result.comparison?.conformance;
  const isPartial = hasConformance && result.reviewStatus !== "reviewed";
  const resolvedCount = conformance ? conformance.passed + conformance.failed : 0;

  // Priority-first (A2): deterministic impact × reach ordering; top 5 surfaced.
  const orderedFindings = priorityFindings(result.findings);
  const top = orderedFindings.slice(0, 5);

  const navSections = [
    { id: "summary", label: t("navSummary") },
    ...(orderedFindings.length > 0 ? [{ id: "top-issues", label: t("navTopIssues") }] : []),
    ...(hasConformance ? [{ id: "methods", label: t("navByMethod") }] : []),
    ...(hasConformance ? [{ id: "conformance", label: t("navAllCriteria") }] : []),
    ...(hasAnalysis ? [{ id: "analysis", label: t("navSiteSignals") }] : []),
    { id: "findings", label: t("navFindings") },
    { id: "mark", label: t("navMark") },
    { id: "methodology", label: t("navMethodology") },
    { id: "log", label: t("navLog") },
  ];

  return (
    <section
      aria-labelledby="report-heading"
      className={`mt-8 ${largePrint ? "large-print" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="report-heading" className="font-display text-lg font-semibold text-terminal-fg">
          {t("reportTitle")}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink href={`/api/v1/assessments/${result.id}/export?format=pdf`} variant="outline" size="sm">
            {t("downloadPdf")}
          </ButtonLink>
          <ButtonLink href={`/api/v1/assessments/${result.id}/vpat`} variant="outline" size="sm">
            {t("downloadAcr")}
          </ButtonLink>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLargePrint((value) => !value)}
            aria-pressed={largePrint}
          >
            {largePrint ? t("normalPrint") : t("largePrint")}
          </Button>
        </div>
      </div>

      <nav
        aria-label={t("navAria")}
        className="sticky top-0 z-10 -mx-4 mt-4 border-b border-terminal-border bg-terminal-bg px-4 py-2"
      >
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
          {navSections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-4 font-sans leading-7 text-terminal-fg">
        {buildReportSummary(result, locale)}
      </p>

      <div id="summary" className="mt-4 scroll-mt-24">
        <ScoreSummary
          conformance={result.comparison?.conformance}
          findings={result.findings}
        />
      </div>

      {isPartial && conformance && (
        <div role="note" className="mt-4 rounded border border-terminal-serious bg-terminal-surface/40 p-3">
          <p className="font-sans text-sm text-terminal-fg">
            <span className="font-semibold text-terminal-serious">{t("partialTitle")}</span>{" "}
            {t("partialBody", {
              resolved: resolvedCount,
              total: conformance.total,
              cannotTell: conformance.cannotTell,
            })}
          </p>
        </div>
      )}

      {result.partial && (
        <p className="mt-3 font-sans text-sm text-terminal-moderate">
          {t("crawlLimitNote")}
        </p>
      )}

      {result.reviewStatus === "reviewed" && result.snapshotAt && (
        <p className="mt-3 font-sans text-xs text-terminal-muted">
          {t("reviewedNote", { date: new Date(result.snapshotAt).toUTCString() })}
        </p>
      )}

      {hasConformance && (
        <div id="methods" className="scroll-mt-24">
          <ReviewMethods
            conformance={result.comparison?.conformance}
            ai={result.comparison?.ai}
          />
        </div>
      )}

      <div id="conformance" className="scroll-mt-24">
        {result.comparison?.conformance && (
          <ConformanceTable conformance={result.comparison.conformance} />
        )}
      </div>

      <div id="analysis" className="scroll-mt-24">
        <ComparisonPanel result={result} />
      </div>

      <div id="findings" className="mt-8 scroll-mt-24">
        {orderedFindings.length > 0 && (
          <div id="top-issues" className="mb-8 scroll-mt-24">
            <h2 className="font-display text-base font-semibold text-terminal-fg">{t("topIssuesHeading")}</h2>
            <p className="mt-1 font-sans text-sm text-terminal-muted">
              {t("topIssuesIntro")}
            </p>
            <ol className="mt-3 space-y-2">
              {top.map((finding, index) => {
                const sc = finding.wcagSc?.[0];
                return (
                  <li key={`${finding.ruleId}-${finding.pageUrl}-${index}`}>
                    <a
                      href={`#finding-${index}`}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded border border-terminal-border bg-terminal-surface/40 px-3 py-2 hover:border-terminal-serious"
                    >
                      <span className="font-sans text-xs text-terminal-muted">{index + 1}.</span>
                      <span className={`font-sans text-xs font-semibold uppercase ${impactColor(finding.impact)}`}>
                        {impactLabel(finding.impact, locale)}
                      </span>
                      <span className="font-sans text-sm text-terminal-fg">{finding.description}</span>
                      {sc && <span className="font-sans text-xs text-terminal-muted">WCAG {sc}</span>}
                      {index === 0 && (
                        <span className="ml-auto font-sans text-xs font-semibold text-terminal-serious">
                          {t("fixFirst")}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <h2 className="font-display text-base font-semibold text-terminal-fg">
          {t("findingsHeading", { count: result.findings.length })}
        </h2>
        {result.findings.length === 0 ? (
          <p className="mt-2 font-sans text-sm text-terminal-pass">
            {t("noViolations")}
          </p>
        ) : (
          orderedFindings.map((finding, index) => (
            <div
              key={`${finding.ruleId}-${finding.pageUrl}-${index}`}
              id={`finding-${index}`}
              className="scroll-mt-24"
            >
              <FindingEvidence finding={finding} assessmentId={result.id} />
            </div>
          ))
        )}
      </div>

      <div id="mark" className="scroll-mt-24">
        <ReportMark assessmentId={result.id} />
      </div>

      <div id="methodology" className="scroll-mt-24">
        <Methodology result={result} />
      </div>

      <div id="log" className="mt-6 scroll-mt-24">
        <LogPanel entries={result.log ?? []} />
      </div>
    </section>
  );
}
