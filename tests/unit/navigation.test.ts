import { describe, expect, it } from "vitest";
import {
  PRIMARY_NAV,
  RELATED_LINKS,
  ACCOUNT_MENU,
  PAGE_LABELS,
} from "@/lib/site/navigation";

describe("flat navigation data", () => {
  it("PRIMARY_NAV is flat and unique", () => {
    const hrefs = PRIMARY_NAV.map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(PRIMARY_NAV.length).toBe(6);
  });

  it("ACCOUNT_MENU includes history, account, and settings", () => {
    expect(ACCOUNT_MENU.map((l) => l.href)).toEqual(["/auditor", "/account", "/settings"]);
  });

  it("RELATED_LINKS is reciprocal (if A links B, B links A)", () => {
    for (const [path, related] of Object.entries(RELATED_LINKS)) {
      for (const link of related) {
        const back = RELATED_LINKS[link.href];
        expect(back, `${link.href} does not link back to ${path}`).toBeDefined();
        expect(
          back?.map((l) => l.href) ?? [],
          `${link.href} missing back-link to ${path}`,
        ).toContain(path);
      }
    }
  });

  it("RELATED_LINKS labels all resolve to a PAGE_LABELS key", () => {
    for (const [path, related] of Object.entries(RELATED_LINKS)) {
      for (const link of related) {
        expect(PAGE_LABELS[link.href], `no label for ${link.href} (from ${path})`).toBeDefined();
        expect(link.label).toBe(PAGE_LABELS[link.href]);
      }
    }
  });

  it("content hubs have at least 3 related links (tool pages exempt)", () => {
    const toolPages = new Set(["/assess"]);
    for (const [path, related] of Object.entries(RELATED_LINKS)) {
      if (toolPages.has(path)) continue;
      expect(related.length, `${path} has <3 related links`).toBeGreaterThanOrEqual(3);
    }
  });
});
