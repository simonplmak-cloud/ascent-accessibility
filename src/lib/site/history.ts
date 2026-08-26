export type HistoryStatus = "queued" | "running" | "completed" | "failed";
export type HistoryStatusFilter = "all" | HistoryStatus;
export type HistorySortKey = "createdAt" | "conformance";
export type SortDirection = "asc" | "desc";

export type ConformanceOutcome = "conforms" | "does-not-conform" | "undetermined";

export interface HistoryItem {
  id: string;
  url: string;
  standard: string;
  standardLabel?: string | null;
  status: HistoryStatus;
  conformance: ConformanceOutcome | null;
  pagesScanned: number;
  partial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UrlGroup {
  url: string;
  scans: HistoryItem[];
}

const OUTCOME_RANK: Record<ConformanceOutcome, number> = {
  conforms: 0,
  "does-not-conform": 1,
  undetermined: 2,
};

import { outcomeLabel as localizedOutcome } from "@/lib/site/labels";

export function outcomeLabel(
  outcome: ConformanceOutcome | null | undefined,
  locale?: string,
): string {
  return localizedOutcome(outcome, locale);
}

export function outcomeRank(outcome: ConformanceOutcome | null | undefined): number {
  return outcome == null ? 99 : (OUTCOME_RANK[outcome] ?? 3);
}

export function filterByStatus(
  items: HistoryItem[],
  status: HistoryStatusFilter,
): HistoryItem[] {
  if (status === "all") return items;
  return items.filter((item) => item.status === status);
}

export function sortHistory(
  items: HistoryItem[],
  key: HistorySortKey,
  direction: SortDirection,
): HistoryItem[] {
  return [...items].sort((a, b) => compare(a, b, key, direction));
}

function compare(
  a: HistoryItem,
  b: HistoryItem,
  key: HistorySortKey,
  direction: SortDirection,
): number {
  if (key === "conformance") {
    if (a.conformance == null && b.conformance == null) return 0;
    if (a.conformance == null) return 1; // null outcomes always sort last
    if (b.conformance == null) return -1;
    const diff = outcomeRank(a.conformance) - outcomeRank(b.conformance);
    return direction === "desc" ? diff : -diff;
  }
  const diff = Date.parse(a.createdAt) - Date.parse(b.createdAt);
  return direction === "desc" ? -diff : diff;
}

export function groupByUrl(items: HistoryItem[]): UrlGroup[] {
  const byUrl = new Map<string, HistoryItem[]>();
  for (const item of items) {
    if (item.status !== "completed" || item.conformance == null) continue;
    const scans = byUrl.get(item.url) ?? [];
    scans.push(item);
    byUrl.set(item.url, scans);
  }

  return [...byUrl.entries()]
    .map(([url, scans]) => ({
      url,
      scans: scans.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)),
    }))
    .filter((group) => group.scans.length >= 2)
    .sort((a, b) => b.scans.length - a.scans.length);
}
