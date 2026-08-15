export type ScanScope = "page" | "site";

export interface CrawlScope {
  depth: number;
  pageCap: number;
}

export function resolveCrawlScope(
  scope: ScanScope,
  depth?: number,
  pageCap?: number,
): CrawlScope {
  if (scope === "page") return { depth: 0, pageCap: 1 };
  return { depth: depth ?? 3, pageCap: pageCap ?? 100 };
}
