"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BulkActionBar } from "@/components/efficiency/bulk-action-bar";
import { SavedViews } from "@/components/efficiency/saved-views";
import type { ViewState } from "@/lib/efficiency/saved-views";
import {
  filterByStatus,
  outcomeLabel,
  sortHistory,
  type HistoryItem,
  type HistorySortKey,
  type HistoryStatusFilter,
  type SortDirection,
} from "@/lib/site/history";
import { standardName } from "@/lib/standards/standards-locales";

type T = ReturnType<typeof useTranslations<"auditor">>;

function statusLabel(status: HistoryItem["status"], t: T): string {
  switch (status) {
    case "queued":
      return t("labelQueued");
    case "running":
      return t("labelRunning");
    case "completed":
      return t("labelCompleted");
    default:
      return t("labelFailed");
  }
}

const PAGE_SIZE = 20;

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

interface AssessmentTableProps {
  items: HistoryItem[];
  busyIds: Set<string>;
  onReRun: (item: HistoryItem) => void;
  onDelete: (item: HistoryItem) => void;
}

export function AssessmentTable({ items, busyIds, onReRun, onDelete }: AssessmentTableProps) {
  const t = useTranslations("auditor");
  const locale = useLocale();
  const [status, setStatus] = useState<HistoryStatusFilter>("all");
  const [sortKey, setSortKey] = useState<HistorySortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [status, sortKey, sortDir]);

  const visible = useMemo(
    () => sortHistory(filterByStatus(items, status), sortKey, sortDir),
    [items, status, sortKey, sortDir],
  );

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = visible.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const selectedItems = useMemo(
    () => visible.filter((item) => selected.has(item.id)),
    [visible, selected],
  );

  const view: ViewState = {
    status: status === "all" ? "" : status,
    sort: sortKey,
    dir: sortDir,
  };

  function applyView(v: ViewState) {
    setStatus((v.status as HistoryStatusFilter) || "all");
    setSortKey((v.sort as HistorySortKey) || "createdAt");
    setSortDir(v.dir === "asc" ? "asc" : "desc");
  }

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

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allVisibleSelected = pageItems.length > 0 && pageItems.every((i) => selected.has(i.id));

  function toggleSelectAll() {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        for (const item of pageItems) next.delete(item.id);
        return next;
      }
      const next = new Set(prev);
      for (const item of pageItems) next.add(item.id);
      return next;
    });
  }

  function bulkReRun() {
    for (const item of selectedItems) onReRun(item);
    setSelected(new Set());
  }

  function bulkDelete() {
    if (!window.confirm(t("deleteManyConfirm", { count: selectedItems.length }))) return;
    for (const item of selectedItems) onDelete(item);
    setSelected(new Set());
  }

  return (
    <section aria-labelledby="history-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="history-heading" className="font-display text-lg font-semibold text-terminal-fg">
          {t("historyTitle")}
        </h2>
        <label className="flex items-center gap-2 font-sans text-sm text-terminal-muted">
          {t("filter")}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as HistoryStatusFilter)}
            className="rounded border border-terminal-border bg-terminal-surface px-2 py-1 font-sans text-sm text-terminal-fg"
          >
            <option value="all">{t("allStatuses")}</option>
            <option value="queued">{t("statusQueued")}</option>
            <option value="running">{t("statusRunning")}</option>
            <option value="completed">{t("statusCompleted")}</option>
            <option value="failed">{t("statusFailed")}</option>
          </select>
        </label>
      </div>

      <div className="mt-3">
        <SavedViews current={view} onApply={applyView} />
      </div>

      <div className="mt-3">
        <BulkActionBar
          count={selectedItems.length}
          actions={[
            { id: "re-run", label: t("reRunSelected"), run: bulkReRun },
            { id: "delete", label: t("deleteSelected"), run: bulkDelete, destructive: true },
          ]}
        />
      </div>

      <div className="mt-3 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-sans text-sm">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="w-8 px-3 py-2">
                <input
                  type="checkbox"
                  aria-label={t("selectAll")}
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  className="align-middle"
                />
              </th>
              <th
                scope="col"
                aria-sort={sortKey === "conformance" ? (sortDir === "desc" ? "descending" : "ascending") : "none"}
                className="px-3 py-2 font-medium"
              >
                <button type="button" onClick={() => toggleSort("conformance")} className="hover:text-terminal-fg">
                  {t("thConformance")} <span aria-hidden="true">{indicator("conformance")}</span>
                </button>
              </th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thUrl")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thStandard")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thStatus")}</th>
              <th
                scope="col"
                aria-sort={sortKey === "createdAt" ? (sortDir === "desc" ? "descending" : "ascending") : "none"}
                className="px-3 py-2 font-medium"
              >
                <button type="button" onClick={() => toggleSort("createdAt")} className="hover:text-terminal-fg">
                  {t("thDate")} <span aria-hidden="true">{indicator("createdAt")}</span>
                </button>
              </th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thActions")}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => {
              const busy = busyIds.has(item.id);
              const isSelected = selected.has(item.id);
              return (
                <tr
                  key={item.id}
                  className={`border-b border-terminal-border last:border-b-0 ${isSelected ? "bg-terminal-bg" : ""}`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={t("selectItem", { url: item.url })}
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="align-middle"
                    />
                  </td>
                  <td className="px-3 py-2 text-terminal-fg">{outcomeLabel(item.conformance, locale)}</td>
                  <td className="max-w-[260px] truncate px-3 py-2 text-terminal-fg" title={item.url}>
                    {item.url}
                  </td>
                  <td className="px-3 py-2 text-terminal-muted">{item.standardLabel ?? standardName(item.standard, locale)}</td>
                  <td className="px-3 py-2">
                    <span className={statusClass(item.status)}>{statusLabel(item.status, t)}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-terminal-muted">{formatDate(item.createdAt)}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/auditor/report/${item.id}`}
                        aria-label={t("openReport", { url: item.url })}
                        className="text-terminal-fg underline-offset-4 hover:underline"
                      >
                        {t("open")}
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => onReRun(item)}
                        disabled={busy}
                        aria-label={t("rerunAria", { url: item.url })}
                      >
                        {t("reRun")}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (window.confirm(t("deleteConfirm", { url: item.url }))) onDelete(item);
                        }}
                        disabled={busy}
                        aria-label={t("deleteAria", { url: item.url })}
                        className="text-terminal-critical"
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-terminal-muted">
                  {t("noMatch")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-sm text-terminal-muted">
            {t("showing", {
              start: visible.length === 0 ? 0 : currentPage * PAGE_SIZE + 1,
              end: Math.min((currentPage + 1) * PAGE_SIZE, visible.length),
              total: visible.length,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              {t("previous")}
            </Button>
            <span className="font-sans text-sm text-terminal-muted">
              {t("pageOf", { page: currentPage + 1, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
