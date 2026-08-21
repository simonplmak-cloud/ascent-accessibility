"use client";

import { useState } from "react";
import { ScoreSummary } from "./score-summary";
import { ConformanceTable } from "./conformance-table";
import { ManualReviewChecklist } from "./manual-review-checklist";
import { ComparisonPanel } from "./comparison-panel";
import { FindingEvidence } from "./finding-evidence";
import { Methodology } from "./methodology";
import { LogPanel } from "./log-panel";
import { buildReportSummary } from "@/lib/report-summary";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import type { AssessmentResult } from "./types";

export function Report({ result }: { result: AssessmentResult }) {
  const [largePrint, setLargePrint] = useState(false);

  const hasConformance = Boolean(result.comparison?.conformance);
  const hasAnalysis = Boolean(result.comparison);
  const cannotTellCount =
    result.comparison?.conformance?.rows?.filter((row) => row.result === "CannotTell").length ?? 0;

  const navSections = [
    { id: "summary", label: "Summary" },
    ...(hasConformance ? [{ id: "conformance", label: "Conformance" }] : []),
    ...(cannotTellCount > 0 ? [{ id: "manual-review", label: "Manual review" }] : []),
    ...(hasAnalysis ? [{ id: "analysis", label: "Analysis" }] : []),
    { id: "findings", label: "Findings" },
    { id: "methodology", label: "Methodology" },
    { id: "log", label: "Log" },
  ];

  return (
    <section
      aria-labelledby="report-heading"
      className={`mt-8 ${largePrint ? "large-print" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="report-heading" className="font-mono text-lg font-semibold text-terminal-fg">
          Assessment report
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink href={`/api/v1/assessments/${result.id}/export?format=pdf`} variant="outline" size="sm">
            Download PDF
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
                className="font-mono text-sm text-terminal-fg underline-offset-4 hover:underline"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-4 font-mono leading-7 text-terminal-fg">
        {buildReportSummary(result)}
      </p>

      <div id="summary" className="mt-4 scroll-mt-24">
        <ScoreSummary
          conformance={result.comparison?.conformance}
          findings={result.findings}
        />
      </div>

      {result.partial && (
        <p className="mt-3 font-mono text-sm text-terminal-moderate">
          Note: crawl limits reached — this report covers a subset of pages.
        </p>
      )}

      {result.reviewStatus === "reviewed" && result.snapshotAt && (
        <p className="mt-3 font-mono text-xs text-terminal-muted">
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
        <h2 className="font-mono text-base font-semibold text-terminal-fg">
          Findings ({result.findings.length})
        </h2>
        {result.findings.length === 0 ? (
          <p className="mt-2 font-mono text-sm text-terminal-pass">
            No automated violations detected.
          </p>
        ) : (
          result.findings.map((finding, index) => (
            <FindingEvidence
              key={`${finding.ruleId}-${finding.pageUrl}-${index}`}
              finding={finding}
              assessmentId={result.id}
            />
          ))
        )}
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
