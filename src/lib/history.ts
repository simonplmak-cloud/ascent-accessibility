export type HistoryStatus = "queued" | "running" | "completed" | "failed";
export type HistoryStatusFilter = "all" | HistoryStatus;
export type HistorySortKey = "createdAt" | "score";
export type SortDirection = "asc" | "desc";

export interface HistoryItem {
  id: string;
  url: string;
  standard: string;
  status: HistoryStatus;
  score: number | null;
  passBand: string | null;
  pagesScanned: number;
  partial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UrlGroup {
  url: string;
  scans: HistoryItem[];
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
  if (key === "score") {
    const sa = a.score;
    const sb = b.score;
    if (sa == null && sb == null) return 0;
    if (sa == null) return 1; // null scores always sort last
    if (sb == null) return -1;
    const diff = sa - sb;
    return direction === "desc" ? -diff : diff;
  }
  const diff = Date.parse(a.createdAt) - Date.parse(b.createdAt);
  return direction === "desc" ? -diff : diff;
}

export function groupByUrl(items: HistoryItem[]): UrlGroup[] {
  const byUrl = new Map<string, HistoryItem[]>();
  for (const item of items) {
    if (item.status !== "completed" || item.score == null) continue;
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
