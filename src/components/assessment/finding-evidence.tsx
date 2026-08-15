import { getSc, understandingUrl } from "@/lib/standards/wcag-sc";
import { impactColor } from "./severity";
import type { Finding } from "./types";

function confidenceClass(confidence?: string): string {
  return confidence === "confirmed" ? "text-terminal-pass" : "text-terminal-muted";
}

function evidenceUrl(assessmentId: string, evidenceId: string): string {
  return `/api/v1/assessments/${assessmentId}/evidence/${encodeURIComponent(evidenceId)}`;
}

export function FindingEvidence({
  finding,
  assessmentId,
}: {
  finding: Finding;
  assessmentId: string;
}) {
  const sc = finding.wcagSc?.[0];
  const scInfo = sc ? getSc(sc) : undefined;
  const instances = finding.instances ?? [];

  return (
    <article className="mt-4 rounded border border-terminal-border bg-terminal-surface/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`font-mono text-xs font-semibold uppercase ${impactColor(finding.impact)}`}>
          {finding.impact}
        </span>
        {sc && scInfo && (
          <a
            href={understandingUrl(scInfo)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-terminal-fg underline underline-offset-2 hover:text-terminal-serious"
          >
            WCAG {sc} · {scInfo.title} (Level {scInfo.level})
          </a>
        )}
        {!sc && (
          <span className="font-mono text-xs text-terminal-muted">Best practice</span>
        )}
        {finding.confidence && (
          <span className={`font-mono text-xs ${confidenceClass(finding.confidence)}`}>
            {finding.confidence === "confirmed" ? "confirmed by 2+ tools" : "single source"}
          </span>
        )}
      </div>

      <p className="mt-2 font-mono text-sm text-terminal-fg">{finding.description}</p>
      <p className="mt-1 font-mono text-xs text-terminal-muted">{finding.pageUrl}</p>

      {finding.sources && finding.sources.length > 0 && (
        <p className="mt-2 font-mono text-xs text-terminal-muted">
          Detected by:{" "}
          {[...new Set(finding.sources.map((s) => s.tool))].map((t) => t.toUpperCase()).join(", ")}
        </p>
      )}

      {instances.length > 0 && (
        <div className="mt-3 space-y-3">
          {instances.slice(0, 5).map((instance, i) => (
            <div key={i} className="rounded border border-terminal-border p-3">
              {instance.target && (
                <code className="block break-all font-mono text-xs text-terminal-muted">
                  {instance.target}
                </code>
              )}
              {instance.html && (
                <code className="mt-1 block overflow-x-auto whitespace-pre-wrap break-all rounded bg-terminal-bg p-2 font-mono text-xs text-terminal-fg">
                  {instance.html}
                </code>
              )}
              {instance.failureSummary && (
                <p className="mt-1 font-mono text-xs text-terminal-serious">{instance.failureSummary}</p>
              )}
              {instance.evidenceId && (
                <img
                  src={evidenceUrl(assessmentId, instance.evidenceId)}
                  alt={`Screenshot evidence for ${finding.ruleId} on ${finding.pageUrl}`}
                  className="mt-2 max-h-64 rounded border border-terminal-border"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 font-mono text-sm text-terminal-fg">
        <span className="text-terminal-serious">Fix:</span> {finding.recommendation}
      </p>
    </article>
  );
}
