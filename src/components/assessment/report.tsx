"use client";

import { useState } from "react";
import { ScoreSummary } from "./score-summary";
import { ConformanceTable } from "./conformance-table";
import { ManualReviewChecklist } from "./manual-review-checklist";
import { ComparisonPanel } from "./comparison-panel";
import { FindingEvidence } from "./finding-evidence";
import { Methodology } from "./methodology";
import { LogPanel } from "./log-panel";
import { ReportMark } from "./report-mark";
import { buildReportSummary } from "@/lib/report-summary";
import { priorityFindings } from "@/lib/report-priority";
import { impactColor } from "./severity";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import type { AssessmentResult } from "./types";

export function Report({ result }: { result: AssessmentResult }) {
  const [largePrint, setLargePrint] = useState(false);

  const hasConformance = Boolean(result.comparison?.conformance);
  const hasAnalysis = Boolean(result.comparison);
  const cannotTellCount =
    result.comparison?.conformance?.rows?.filter((row) => row.result === "CannotTell").length ?? 0;

  // Partial completion (Phase 2): the report is partial unless human review is done.
  // Human review is coming soon, so today every report is partial — mark it honestly.
  const conformance = result.comparison?.conformance;
  const isPartial = hasConformance && result.reviewStatus !== "reviewed";
  const resolvedCount = conformance ? conformance.passed + conformance.failed : 0;

  // Priority-first (A2): deterministic impact × reach ordering; top 5 surfaced.
  const orderedFindings = priorityFindings(result.findings);
  const top = orderedFindings.slice(0, 5);

  const navSections = [
    { id: "summary", label: "Summary" },
    ...(orderedFindings.length > 0 ? [{ id: "top-issues", label: "Top issues" }] : []),
    ...(hasConformance ? [{ id: "conformance", label: "Conformance" }] : []),
    ...(cannotTellCount > 0 ? [{ id: "manual-review", label: "Manual review" }] : []),
    ...(hasAnalysis ? [{ id: "analysis", label: "Analysis" }] : []),
    { id: "findings", label: "Findings" },
    { id: "mark", label: "Mark" },
    { id: "methodology", label: "Methodology" },
    { id: "log", label: "Log" },
  ];

  return (
    <section
      aria-labelledby="report-heading"
      className={`mt-8 ${largePrint ? "large-print" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="report-heading" className="font-display text-lg font-semibold text-terminal-fg">
          Assessment report
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink href={`/api/v1/assessments/${result.id}/export?format=pdf`} variant="outline" size="sm">
            Download PDF
          </ButtonLink>
          <ButtonLink href={`/api/v1/assessments/${result.id}/vpat`} variant="outline" size="sm">
            Download ACR (draft)
          </ButtonLink>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLargePrint((value) => !value)}
            aria-pressed={largePrint}
          >
            {largePrint ? "Normal print" : "Large print"}
          </Button>
        </div>
      </div>

      <nav
        aria-label="Report sections"
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
        {buildReportSummary(result)}
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
            <span className="font-semibold text-terminal-serious">Partial result.</span> This report
            is based on automated and AI-assisted checks only: {resolvedCount} of {conformance.total}{" "}
            criteria resolved by machine; {conformance.cannotTell} still need human review (coming
            soon). It is not a full conformance evaluation.
          </p>
        </div>
      )}

      {result.partial && (
        <p className="mt-3 font-sans text-sm text-terminal-moderate">
          Note: crawl limits reached — this report covers a subset of pages.
        </p>
      )}

      {result.reviewStatus === "reviewed" && result.snapshotAt && (
        <p className="mt-3 font-sans text-xs text-terminal-muted">
          Conformance evaluated as at {new Date(result.snapshotAt).toUTCString()}. This report is a
          professional opinion, not a certified audit or legal advice.
        </p>
      )}

      <div id="conformance" className="scroll-mt-24">
        {result.comparison?.conformance && (
          <ConformanceTable conformance={result.comparison.conformance} />
        )}
      </div>

      <div id="manual-review" className="scroll-mt-24">
        {result.comparison?.conformance && (
          <ManualReviewChecklist conformance={result.comparison.conformance} />
        )}
      </div>

      <div id="analysis" className="scroll-mt-24">
        <ComparisonPanel result={result} />
      </div>

      <div id="findings" className="mt-8 scroll-mt-24">
        {orderedFindings.length > 0 && (
          <div id="top-issues" className="mb-8 scroll-mt-24">
            <h2 className="font-display text-base font-semibold text-terminal-fg">Top issues</h2>
            <p className="mt-1 font-sans text-sm text-terminal-muted">
              Fix these first — ranked by user impact × reach. Full evidence below.
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
                        {finding.impact}
                      </span>
                      <span className="font-sans text-sm text-terminal-fg">{finding.description}</span>
                      {sc && <span className="font-sans text-xs text-terminal-muted">WCAG {sc}</span>}
                      {index === 0 && (
                        <span className="ml-auto font-sans text-xs font-semibold text-terminal-serious">
                          Fix this first
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
          Findings ({result.findings.length})
        </h2>
        {result.findings.length === 0 ? (
          <p className="mt-2 font-sans text-sm text-terminal-pass">
            No automated violations detected.
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
