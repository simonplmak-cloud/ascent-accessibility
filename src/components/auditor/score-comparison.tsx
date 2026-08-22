"use client";

import { useTranslations } from "next-intl";
import { groupByUrl, outcomeLabel, outcomeRank, type HistoryItem } from "@/lib/history";

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

function deltaIndicator(current: HistoryItem, previous?: HistoryItem): string | null {
  if (!previous || previous.conformance == null || current.conformance == null) return null;
  const diff = outcomeRank(previous.conformance) - outcomeRank(current.conformance);
  if (diff > 0) return "↑";
  if (diff < 0) return "↓";
  return "→";
}

export function ScoreComparison({ items }: { items: HistoryItem[] }) {
  const t = useTranslations("auditor");
  const groups = groupByUrl(items);
  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="comparison-heading" className="mt-8">
      <h2 id="comparison-heading" className="font-display text-lg font-semibold text-terminal-fg">
        {t("trendTitle")}
      </h2>
      <div className="mt-4 grid gap-4">
        {groups.map((group) => (
          <div key={group.url} className="rounded border border-terminal-border p-4">
            <div className="truncate font-sans text-sm text-terminal-fg" title={group.url}>
              {group.url}
            </div>
            <div className="mt-1 font-sans text-xs text-terminal-muted">
              {t("scans", { count: group.scans.length })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.scans.map((scan, i) => {
                const indicator = deltaIndicator(scan, group.scans[i - 1]);
                return (
                  <div
                    key={scan.id}
                    className="rounded border border-terminal-border px-3 py-2 text-center"
                  >
                    <div className="font-sans text-xs text-terminal-muted">
                      {formatShort(scan.createdAt)}
                    </div>
                    <div className="font-sans text-sm font-semibold text-terminal-fg">
                      {outcomeLabel(scan.conformance)}
                    </div>
                    {indicator && (
                      <div
                        className={`font-sans text-xs ${
                          indicator === "↑"
                            ? "text-terminal-pass"
                            : indicator === "↓"
                              ? "text-terminal-fail"
                              : "text-terminal-muted"
                        }`}
                      >
                        {indicator}
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
