import { describe, expect, it } from "vitest";
import { resolveCrawlScope } from "@/lib/assessment/scope";
import { assessRequestSchema } from "@/server/validation";

describe("resolveCrawlScope", () => {
  it("maps page scope to a single-page crawl (AC-1)", () => {
    expect(resolveCrawlScope("page", 3, 100)).toEqual({ depth: 0, pageCap: 1 });
  });

  it("maps site scope to a full crawl with defaults (AC-2/AC-3)", () => {
    expect(resolveCrawlScope("site")).toEqual({ depth: 3, pageCap: 100 });
  });

  it("preserves explicit depth/pageCap for site scope", () => {
    expect(resolveCrawlScope("site", 2, 50)).toEqual({ depth: 2, pageCap: 50 });
  });
});

describe("assessRequestSchema", () => {
  it("defaults scope to site (AC-3)", () => {
    expect(assessRequestSchema.parse({ url: "https://x.com" }).scope).toBe("site");
  });

  it("accepts scope page", () => {
    expect(assessRequestSchema.parse({ url: "https://x.com", scope: "page" }).scope).toBe("page");
  });

  it("rejects an invalid scope (AC-E1)", () => {
    expect(assessRequestSchema.safeParse({ url: "https://x.com", scope: "nope" }).success).toBe(false);
  });
});
