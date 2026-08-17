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
          <ButtonLink href={`/api/v1/assessments/${result.id}/export?format=csv`} variant="outline" size="sm">
            Download CSV
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

      <p className="mt-4 font-mono leading-7 text-terminal-fg">
        {buildReportSummary(result)}
      </p>

      <div className="mt-4">
        <ScoreSummary
          score={result.score}
          passBand={result.passBand}
          findings={result.findings}
        />
      </div>

      {result.partial && (
        <p className="mt-3 font-mono text-sm text-terminal-moderate">
          Note: crawl limits reached — this report covers a subset of pages.
        </p>
      )}

      {result.comparison?.conformance && (
        <ConformanceTable conformance={result.comparison.conformance} />
      )}
      {result.comparison?.conformance && (
        <ManualReviewChecklist conformance={result.comparison.conformance} />
      )}
      <ComparisonPanel result={result} />

      <div className="mt-8">
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

      <Methodology result={result} />

      <div className="mt-6">
        <LogPanel entries={result.log ?? []} />
      </div>
    </section>
  );
}
