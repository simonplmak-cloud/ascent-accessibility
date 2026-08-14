import { ScoreSummary } from "./score-summary";
import { FindingsGrid } from "./findings-grid";
import { LogPanel } from "./log-panel";
import type { AssessmentResult } from "./types";

export function Report({ result }: { result: AssessmentResult }) {
  return (
    <section aria-labelledby="report-heading" className="mt-8">
      <h2 id="report-heading" className="font-mono text-lg font-semibold text-terminal-fg">
        Assessment report
      </h2>

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

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={`/api/v1/assessments/${result.id}/export?format=pdf`}
          className="rounded border border-terminal-border px-3 py-1 font-mono text-sm text-terminal-fg hover:bg-terminal-surface"
        >
          Download PDF
        </a>
        <a
          href={`/api/v1/assessments/${result.id}/export?format=csv`}
          className="rounded border border-terminal-border px-3 py-1 font-mono text-sm text-terminal-fg hover:bg-terminal-surface"
        >
          Download CSV
        </a>
      </div>

      <div className="mt-6">
        <FindingsGrid findings={result.findings} />
      </div>

      <div className="mt-6">
        <LogPanel entries={result.log ?? []} />
      </div>
    </section>
  );
}
