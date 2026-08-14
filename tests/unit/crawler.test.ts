import { describe, expect, it } from "vitest";
import {
  crawl,
  extractLinks,
  fetchSitemapUrls,
  isAllowedByRobots,
  isSameOrigin,
  parseRobotsDisallow,
  parseSitemapLocs,
  type CrawlerDeps,
} from "@/lib/crawler";

const noDelay = async () => {};
const noRobots = async () => null;

function fetcher(pages: Record<string, string>): CrawlerDeps["fetchHtml"] {
  return async (url) => {
    const html = pages[url];
    if (html === undefined) throw new Error(`404 ${url}`);
    return html;
  };
}

function deps(pages: Record<string, string>, robots?: string): CrawlerDeps {
  return {
    fetchHtml: fetcher(pages),
    fetchRobots: async () => robots ?? null,
    delay: noDelay,
  };
}

describe("extractLinks", () => {
  it("resolves relative hrefs against the base URL", () => {
    const html = '<a href="/about">About</a><a href="contact">Contact</a>';
    const links = extractLinks(html, "https://example.com/dir/page.html");
    expect(links).toContain("https://example.com/about");
    expect(links).toContain("https://example.com/dir/contact");
  });

  it("keeps absolute hrefs and drops non-http(s) schemes", () => {
    const html =
      '<a href="https://example.com/contact">Contact</a><a href="mailto:x@y.z">Mail</a>';
    const links = extractLinks(html, "https://example.com/");
    expect(links).toEqual(["https://example.com/contact"]);
  });

  it("strips fragments", () => {
    const html = '<a href="/about#section">About</a>';
    const links = extractLinks(html, "https://example.com/");
    expect(links).toEqual(["https://example.com/about"]);
  });
});

describe("isSameOrigin", () => {
  it("matches same protocol and host", () => {
    expect(
      isSameOrigin(new URL("https://example.com/x"), new URL("https://example.com/")),
    ).toBe(true);
  });

  it("rejects different host or protocol", () => {
    expect(
      isSameOrigin(new URL("https://evil.com/"), new URL("https://example.com/")),
    ).toBe(false);
    expect(
      isSameOrigin(new URL("http://example.com/"), new URL("https://example.com/")),
    ).toBe(false);
  });
});

describe("robots.txt", () => {
  it("parses disallow rules for the matching user-agent group", () => {
    const content = [
      "User-agent: *",
      "Disallow: /private/",
      "Disallow: /secret$",
      "User-agent: APF-AccessibilityScanner",
      "Disallow: /internal/",
      "",
    ].join("\n");
    const rules = parseRobotsDisallow(content, "APF-AccessibilityScanner");
    expect(rules).toEqual(["/internal/"]);
  });

  it("falls back to the * group", () => {
    const content = ["User-agent: *", "Disallow: /private/", ""].join("\n");
    const rules = parseRobotsDisallow(content, "APF-AccessibilityScanner");
    expect(rules).toEqual(["/private/"]);
  });

  it("matches prefix and $-anchored patterns", () => {
    expect(isAllowedByRobots(new URL("https://x/private/a"), ["/private/"])).toBe(false);
    expect(isAllowedByRobots(new URL("https://x/secret"), ["/secret$"])).toBe(false);
    expect(isAllowedByRobots(new URL("https://x/secret/deep"), ["/secret$"])).toBe(true);
    expect(isAllowedByRobots(new URL("https://x/public"), ["/private/"])).toBe(true);
  });
});

describe("crawl", () => {
  it("crawls a single page with no links", async () => {
    const seed = new URL("https://example.com/");
    const result = await crawl(
      seed,
      {},
      deps({ "https://example.com/": "<html></html>" }),
    );
    expect(result.urls).toEqual(["https://example.com/"]);
    expect(result.partial).toBe(false);
    expect(result.pagesScanned).toBe(1);
  });

  it("discovers same-origin pages breadth-first", async () => {
    const pages = {
      "https://example.com/": '<a href="/about">About</a><a href="https://evil.com/">Evil</a>',
      "https://example.com/about": '<a href="/contact">Contact</a>',
      "https://example.com/contact": "<html></html>",
    };
    const result = await crawl(new URL("https://example.com/"), {}, deps(pages));
    expect(result.urls).toEqual([
      "https://example.com/",
      "https://example.com/about",
      "https://example.com/contact",
    ]);
    expect(result.partial).toBe(false);
  });

  it("honors the depth cap and flags partial", async () => {
    const pages = {
      "https://example.com/": '<a href="/a">A</a>',
      "https://example.com/a": '<a href="/b">B</a>',
      "https://example.com/b": '<a href="/c">C</a>',
    };
    const result = await crawl(
      new URL("https://example.com/"),
      { maxDepth: 1 },
      deps(pages),
    );
    expect(result.urls).toEqual(["https://example.com/", "https://example.com/a"]);
    expect(result.partial).toBe(true);
  });

  it("honors the page cap and flags partial", async () => {
    const pages: Record<string, string> = {
      "https://example.com/": '<a href="/p0">Start</a>',
    };
    for (let i = 0; i < 10; i++) {
      pages[`https://example.com/p${i}`] =
        i < 9 ? `<a href="/p${i + 1}">Next</a>` : "<html></html>";
    }
    const result = await crawl(
      new URL("https://example.com/"),
      { maxPages: 3 },
      deps(pages),
    );
    expect(result.pagesScanned).toBe(3);
    expect(result.partial).toBe(true);
  });

  it("skips pages disallowed by robots.txt", async () => {
    const pages = {
      "https://example.com/": '<a href="/private/secret">Secret</a><a href="/public">Public</a>',
      "https://example.com/public": "<html></html>",
    };
    const robots = "User-agent: *\nDisallow: /private/\n";
    const result = await crawl(new URL("https://example.com/"), {}, deps(pages, robots));
    expect(result.urls).toEqual(["https://example.com/", "https://example.com/public"]);
  });

  it("continues past pages that fail to fetch", async () => {
    const pages = {
      "https://example.com/": '<a href="/missing">Missing</a><a href="/ok">OK</a>',
      "https://example.com/ok": "<html></html>",
    };
    const result = await crawl(new URL("https://example.com/"), {}, deps(pages));
    expect(result.urls).toEqual(["https://example.com/", "https://example.com/ok"]);
  });
});

describe("sitemap", () => {
  it("parses <loc> entries", () => {
    const xml =
      '<urlset><url><loc>https://example.com/a</loc></url><url><loc>https://example.com/b</loc></url></urlset>';
    expect(parseSitemapLocs(xml)).toEqual([
      "https://example.com/a",
      "https://example.com/b",
    ]);
  });

  it("fetchSitemapUrls resolves a sitemap index recursively", async () => {
    const pages = {
      "https://example.com/sitemap.xml":
        '<sitemapindex><sitemap><loc>https://example.com/sitemap-pages.xml</loc></sitemap></sitemapindex>',
      "https://example.com/sitemap-pages.xml":
        '<urlset><url><loc>https://example.com/about</loc></url><url><loc>https://example.com/contact</loc></url></urlset>',
    };
    const d = { fetchHtml: fetcher(pages), fetchRobots: noRobots, delay: noDelay };
    const urls = await fetchSitemapUrls(new URL("https://example.com/"), d);
    expect(urls.sort()).toEqual([
      "https://example.com/about",
      "https://example.com/contact",
    ]);
  });

  it("crawl seeds from the sitemap and flags sitemapUsed", async () => {
    const pages = {
      "https://example.com/sitemap.xml":
        '<urlset><url><loc>https://example.com/deep/page</loc></url></urlset>',
      "https://example.com/": "<html></html>",
      "https://example.com/deep/page": "<html></html>",
    };
    const result = await crawl(new URL("https://example.com/"), {}, deps(pages));
    expect(result.sitemapUsed).toBe(true);
    expect(result.sitemapUrlCount).toBe(1);
    expect(result.urls).toContain("https://example.com/deep/page");
  });

  it("falls back to link crawl when no sitemap exists", async () => {
    const pages = {
      "https://example.com/": '<a href="/about">About</a>',
      "https://example.com/about": "<html></html>",
    };
    const result = await crawl(new URL("https://example.com/"), {}, deps(pages));
    expect(result.sitemapUsed).toBe(false);
    expect(result.sitemapUrlCount).toBe(0);
    expect(result.urls).toEqual(["https://example.com/", "https://example.com/about"]);
  });
});
