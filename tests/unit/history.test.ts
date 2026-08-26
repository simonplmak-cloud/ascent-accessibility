import { describe, expect, it } from "vitest";
import {
  filterByStatus,
  groupByUrl,
  outcomeLabel,
  sortHistory,
  type ConformanceOutcome,
  type HistoryItem,
} from "@/lib/site/history";

function item(overrides: Partial<HistoryItem> = {}): HistoryItem {
  return {
    id: "assessment:1",
    url: "https://example.com",
    standard: "WCAG 2.2 AA",
    status: "completed",
    conformance: "does-not-conform",
    pagesScanned: 10,
    partial: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("outcomeLabel", () => {
  it("maps outcomes to display labels", () => {
    expect(outcomeLabel("conforms")).toBe("Conforms");
    expect(outcomeLabel("does-not-conform")).toBe("Does not conform");
    expect(outcomeLabel("undetermined")).toBe("Not yet evaluated");
    expect(outcomeLabel(null)).toBe("—");
  });
});

describe("filterByStatus", () => {
  const items = [
    item(),
    item({ id: "assessment:2", status: "failed" }),
    item({ id: "assessment:3", status: "running" }),
  ];

  it("returns everything for 'all'", () => {
    expect(filterByStatus(items, "all")).toHaveLength(3);
  });

  it("filters to a single status", () => {
    const result = filterByStatus(items, "completed");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("assessment:1");
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterByStatus(items, "queued")).toHaveLength(0);
  });
});

describe("sortHistory", () => {
  const items = [
    item({ id: "a", createdAt: "2026-01-03T00:00:00Z", conformance: "does-not-conform" }),
    item({ id: "b", createdAt: "2026-01-01T00:00:00Z", conformance: "conforms" }),
    item({ id: "c", createdAt: "2026-01-02T00:00:00Z", conformance: "undetermined" }),
  ];

  it("sorts by date descending (newest first)", () => {
    expect(sortHistory(items, "createdAt", "desc").map((i) => i.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts by date ascending", () => {
    expect(sortHistory(items, "createdAt", "asc").map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts by conformance descending (best outcome first)", () => {
    expect(sortHistory(items, "conformance", "desc").map((i) => i.id)).toEqual(["b", "a", "c"]);
  });

  it("sorts null outcomes last when ascending", () => {
    const withNull = [
      ...items,
      item({ id: "n", createdAt: "2026-01-04T00:00:00Z", conformance: null }),
    ];
    const ids = sortHistory(withNull, "conformance", "asc").map((i) => i.id);
    expect(ids[ids.length - 1]).toBe("n");
  });
});

describe("groupByUrl", () => {
  it("groups completed scans per URL, ascending by date, excluding non-completed", () => {
    const items = [
      item({ id: "a", url: "https://x.com", createdAt: "2026-02-01T00:00:00Z", conformance: "conforms" }),
      item({ id: "b", url: "https://x.com", createdAt: "2026-01-01T00:00:00Z", conformance: "does-not-conform" }),
      item({ id: "c", url: "https://x.com", createdAt: "2026-03-01T00:00:00Z", conformance: "undetermined" }),
      item({ id: "d", url: "https://x.com", createdAt: "2026-01-01T00:00:00Z", status: "failed" }),
      item({ id: "e", url: "https://y.com", createdAt: "2026-01-01T00:00:00Z", conformance: "conforms" }),
    ];
    const groups = groupByUrl(items);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.url).toBe("https://x.com");
    expect(groups[0]?.scans.map((s) => s.id)).toEqual(["b", "a", "c"]);
    expect(groups[0]?.scans.map((s) => s.conformance)).toEqual([
      "does-not-conform",
      "conforms",
      "undetermined",
    ] as ConformanceOutcome[]);
  });

  it("excludes URLs with fewer than two completed scans", () => {
    const items = [
      item({ url: "https://x.com" }),
      item({ id: "y", url: "https://y.com" }),
    ];
    expect(groupByUrl(items)).toHaveLength(0);
  });
});
