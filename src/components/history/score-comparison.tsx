"use client";

import { groupByUrl, type HistoryItem } from "@/lib/history";

function formatShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "2-digit",
  }).format(date);
}

export function ScoreComparison({ items }: { items: HistoryItem[] }) {
  const groups = groupByUrl(items);
  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="comparison-heading" className="mt-8">
      <h2 id="comparison-heading" className="font-mono text-lg font-semibold text-terminal-fg">
        Score comparison
      </h2>
      <div className="mt-4 grid gap-4">
        {groups.map((group) => (
          <div key={group.url} className="rounded border border-terminal-border p-4">
            <div className="truncate font-mono text-sm text-terminal-fg" title={group.url}>
              {group.url}
            </div>
            <div className="mt-1 font-mono text-xs text-terminal-muted">
              {group.scans.length} scans
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.scans.map((scan, i) => {
                const prevScan = i > 0 ? group.scans[i - 1] : undefined;
                const prev = prevScan?.score ?? null;
                const delta = prev != null && scan.score != null ? scan.score - prev : null;
                return (
                  <div
                    key={scan.id}
                    className="rounded border border-terminal-border px-3 py-2 text-center"
                  >
                    <div className="font-mono text-xs text-terminal-muted">
                      {formatShort(scan.createdAt)}
                    </div>
                    <div className="font-mono text-xl font-semibold text-terminal-fg">
                      {scan.score}
                    </div>
                    {delta != null && (
                      <div
                        className={`font-mono text-xs ${
                          delta >= 0 ? "text-terminal-pass" : "text-terminal-fail"
                        }`}
                      >
                        {delta >= 0 ? "+" : ""}
                        {delta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
