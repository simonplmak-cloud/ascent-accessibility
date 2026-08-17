import type { Finding } from "./types";
import { severityCounts } from "./severity";
import { Card } from "@/components/ui/card";

export function ScoreSummary({
  score,
  passBand,
  findings,
}: {
  score: number | null;
  passBand: string | null;
  findings: Finding[];
}) {
  const counts = severityCounts(findings);
  const band = passBand ?? "pending";
  const bandClass =
    band === "pass"
      ? "text-terminal-pass"
      : band === "partial"
        ? "text-terminal-partial"
        : "text-terminal-fail";

  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-8">
      <div>
        <p className="font-mono text-xs uppercase text-terminal-muted">Score</p>
        <p className="font-mono text-5xl font-bold text-terminal-fg">
          {score ?? "—"}
          <span className="text-xl text-terminal-muted">/100</span>
        </p>
      </div>
      <div>
        <p className="font-mono text-xs uppercase text-terminal-muted">Result</p>
        <p className={`font-mono text-lg font-semibold uppercase ${bandClass}`}>{band}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm sm:grid-cols-4">
        <span className="text-terminal-critical">critical {counts.critical}</span>
        <span className="text-terminal-serious">serious {counts.serious}</span>
        <span className="text-terminal-moderate">moderate {counts.moderate}</span>
        <span className="text-terminal-muted">minor {counts.minor}</span>
      </div>
    </Card>
  );
}
