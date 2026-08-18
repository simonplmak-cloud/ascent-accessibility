import type { Finding, Conformance } from "./types";
import { severityCounts } from "./severity";
import { Card } from "@/components/ui/card";

function outcomeLabel(outcome: string | undefined): string {
  if (outcome === "conforms") return "Conforms";
  if (outcome === "does-not-conform") return "Does not conform";
  return "Not yet evaluated";
}

function outcomeClass(outcome: string | undefined): string {
  if (outcome === "conforms") return "text-terminal-pass";
  if (outcome === "does-not-conform") return "text-terminal-fail";
  return "text-terminal-serious";
}

export function ScoreSummary({
  conformance,
  findings,
}: {
  conformance?: Conformance;
  findings: Finding[];
}) {
  const counts = severityCounts(findings);
  const outcome = conformance?.outcome;
  const scsMet = conformance?.scsMet;
  const scsApplicable = conformance?.scsApplicable;

  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-8">
      <div>
        <p className="font-mono text-xs uppercase text-terminal-muted">Outcome</p>
        <p className={`font-mono text-2xl font-bold uppercase ${outcomeClass(outcome)}`}>
          {outcomeLabel(outcome)}
        </p>
      </div>
      {scsApplicable != null && (
        <div>
          <p className="font-mono text-xs uppercase text-terminal-muted">Conformance</p>
          <p className="font-mono text-lg font-semibold text-terminal-fg">
            {scsMet ?? 0}/{scsApplicable} applicable SCs meet
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm sm:grid-cols-4">
        <span className="text-terminal-critical">critical {counts.critical}</span>
        <span className="text-terminal-serious">serious {counts.serious}</span>
        <span className="text-terminal-moderate">moderate {counts.moderate}</span>
        <span className="text-terminal-muted">minor {counts.minor}</span>
      </div>
    </Card>
  );
}
