import type { Finding } from "./types";
import { impactColor, sortFindings } from "./severity";

export function FindingsGrid({ findings }: { findings: Finding[] }) {
  const sorted = sortFindings(findings);

  return (
    <div className="overflow-x-auto rounded border border-terminal-border">
      <table className="w-full border-collapse font-sans text-sm text-terminal-fg">
        <thead>
          <tr className="text-left">
            <th scope="col" className="border-b border-terminal-border px-2 py-1 font-semibold text-terminal-muted">Rule</th>
            <th scope="col" className="border-b border-terminal-border px-2 py-1 font-semibold text-terminal-muted">Impact</th>
            <th scope="col" className="border-b border-terminal-border px-2 py-1 font-semibold text-terminal-muted">Elements</th>
            <th scope="col" className="border-b border-terminal-border px-2 py-1 font-semibold text-terminal-muted">Page</th>
            <th scope="col" className="border-b border-terminal-border px-2 py-1 font-semibold text-terminal-muted">Description</th>
            <th scope="col" className="border-b border-terminal-border px-2 py-1 font-semibold text-terminal-muted">Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((finding, index) => (
            <tr key={`${finding.ruleId}-${index}`} className="align-top">
              <td className="border-b border-terminal-border px-2 py-1">{finding.ruleId}</td>
              <td className="border-b border-terminal-border px-2 py-1">
                <span className={impactColor(finding.impact)}>{finding.impact}</span>
              </td>
              <td className="border-b border-terminal-border px-2 py-1">{finding.elementCount}</td>
              <td className="max-w-[200px] truncate border-b border-terminal-border px-2 py-1">{finding.pageUrl}</td>
              <td className="border-b border-terminal-border px-2 py-1">{finding.description}</td>
              <td className="border-b border-terminal-border px-2 py-1">{finding.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
