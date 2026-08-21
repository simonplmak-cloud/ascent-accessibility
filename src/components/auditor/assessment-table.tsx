"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  filterByStatus,
  outcomeLabel,
  sortHistory,
  type HistoryItem,
  type HistorySortKey,
  type HistoryStatusFilter,
  type SortDirection,
} from "@/lib/history";

const STATUS_LABELS: Record<HistoryItem["status"], string> = {
  queued: "QUEUED",
  running: "RUNNING",
  completed: "COMPLETED",
  failed: "FAILED",
};

function statusClass(status: HistoryItem["status"]): string {
  switch (status) {
    case "completed":
      return "text-terminal-pass";
    case "failed":
      return "text-terminal-fail";
    case "running":
      return "text-terminal-serious";
    default:
      return "text-terminal-muted";
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

interface HistoryTableProps {
  items: HistoryItem[];
  busyIds: Set<string>;
  onReRun: (item: HistoryItem) => void;
  onDelete: (item: HistoryItem) => void;
}

export function AssessmentTable({ items, busyIds, onReRun, onDelete }: HistoryTableProps) {
  const [status, setStatus] = useState<HistoryStatusFilter>("all");
  const [sortKey, setSortKey] = useState<HistorySortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const visible = useMemo(
    () => sortHistory(filterByStatus(items, status), sortKey, sortDir),
    [items, status, sortKey, sortDir],
  );

  function toggleSort(key: HistorySortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function indicator(key: HistorySortKey): string {
    if (key !== sortKey) return "↑↓";
    return sortDir === "desc" ? "↓" : "↑";
  }

  return (
    <section aria-labelledby="history-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="history-heading" className="font-mono text-lg font-semibold text-terminal-fg">
          Assessment history
        </h2>
        <label className="flex items-center gap-2 font-mono text-sm text-terminal-muted">
          Filter
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as HistoryStatusFilter)}
            className="rounded border border-terminal-border bg-terminal-surface px-2 py-1 font-mono text-sm text-terminal-fg"
          >
            <option value="all">All statuses</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-mono text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th
                scope="col"
                aria-sort={sortKey === "conformance" ? (sortDir === "desc" ? "descending" : "ascending") : "none"}
                className="px-3 py-2 font-medium"
              >
                <button type="button" onClick={() => toggleSort("conformance")} className="hover:text-terminal-fg">
                  Conformance <span aria-hidden="true">{indicator("conformance")}</span>
                </button>
              </th>
              <th scope="col" className="px-3 py-2 font-medium">URL</th>
              <th scope="col" className="px-3 py-2 font-medium">Standard</th>
              <th scope="col" className="px-3 py-2 font-medium">Status</th>
              <th
                scope="col"
                aria-sort={sortKey === "createdAt" ? (sortDir === "desc" ? "descending" : "ascending") : "none"}
                className="px-3 py-2 font-medium"
              >
                <button type="button" onClick={() => toggleSort("createdAt")} className="hover:text-terminal-fg">
                  Date <span aria-hidden="true">{indicator("createdAt")}</span>
                </button>
              </th>
              <th scope="col" className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => {
              const busy = busyIds.has(item.id);
              return (
                <tr key={item.id} className="border-b border-terminal-border last:border-b-0">
                  <td className="px-3 py-2 text-terminal-fg">{outcomeLabel(item.conformance)}</td>
                  <td className="max-w-[260px] truncate px-3 py-2 text-terminal-fg" title={item.url}>
                    {item.url}
                  </td>
                  <td className="px-3 py-2 text-terminal-muted">{item.standard}</td>
                  <td className="px-3 py-2">
                    <span className={statusClass(item.status)}>{STATUS_LABELS[item.status]}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-terminal-muted">{formatDate(item.createdAt)}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/auditor/report/${item.id}`}
                        aria-label={`Open report for ${item.url}`}
                        className="text-terminal-fg underline-offset-4 hover:underline"
                      >
                        Open
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => onReRun(item)}
                        disabled={busy}
                        aria-label={`Re-run assessment for ${item.url}`}
                      >
                        Re-run
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => onDelete(item)}
                        disabled={busy}
                        aria-label={`Delete assessment for ${item.url}`}
                        className="text-terminal-critical"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-terminal-muted">
                  No assessments match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
