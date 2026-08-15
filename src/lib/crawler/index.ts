export interface CrawlOptions {
  maxDepth?: number;
  maxPages?: number;
  politenessDelayMs?: number;
  userAgent?: string;
}

export interface CrawlResult {
  urls: string[];
  pagesScanned: number;
  partial: boolean;
  sitemapUsed: boolean;
  sitemapUrlCount: number;
  log?: string[];
}

export interface CrawlerDeps {
  fetchHtml: (url: string) => Promise<string>;
  fetchRobots: (origin: string) => Promise<string | null>;
  delay: (ms: number) => Promise<void>;
}

const HREF_PATTERN = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/gi;
const BASE_PATTERN = /<base\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/i;

function safeResolve(href: string, base: string): URL | null {
  try {
    const url = new URL(href, base);
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

export function extractLinks(html: string, baseUrl: string): string[] {
  const baseMatch = BASE_PATTERN.exec(html);
  const rawBase = baseMatch ? (baseMatch[1] ?? baseMatch[2] ?? baseMatch[3]) : null;
  const base = rawBase ? safeResolve(rawBase, baseUrl) : null;
  const resolvedBase = base ?? new URL(baseUrl);

  const links: string[] = [];
  HREF_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = HREF_PATTERN.exec(html)) !== null) {
    const href = match[1] ?? match[2] ?? match[3];
    if (!href) continue;
    const resolved = safeResolve(href.trim(), resolvedBase.href);
    if (resolved && (resolved.protocol === "http:" || resolved.protocol === "https:")) {
      links.push(resolved.href);
    }
  }
  return links;
}

export function isSameOrigin(url: URL, origin: URL): boolean {
  return url.protocol === origin.protocol && url.host === origin.host;
}

export function parseRobotsDisallow(content: string, userAgent: string): string[] {
  const ua = userAgent.toLowerCase();
  const groups = new Map<string, string[]>();
  let currentUas: string[] = [];

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.split("#")[0]!.trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === "user-agent") {
      const key = value.toLowerCase();
      currentUas = [key];
      if (!groups.has(key)) groups.set(key, []);
    } else if (field === "disallow" && value) {
      for (const key of currentUas) groups.get(key)!.push(value);
    }
  }

  if (groups.has(ua)) return groups.get(ua)!;
  if (groups.has("*")) return groups.get("*")!;
  return [];
}

function matchesDisallow(pattern: string, path: string): boolean {
  if (pattern === "") return false;
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const escaped = body.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  const regex = new RegExp(`^${escaped}${anchored ? "$" : ""}`);
  return regex.test(path);
}

export function isAllowedByRobots(url: URL, disallow: string[]): boolean {
  const path = url.pathname + url.search;
  for (const pattern of disallow) {
    if (matchesDisallow(pattern, path)) return false;
  }
  return true;
}

const LOC_PATTERN = /<loc>([^<]+)<\/loc>/gi;

export function parseSitemapLocs(xml: string): string[] {
  const locs: string[] = [];
  LOC_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = LOC_PATTERN.exec(xml)) !== null) {
    const loc = match[1]!.trim();
    if (loc) locs.push(loc);
  }
  return locs;
}

export async function fetchSitemapUrls(
  origin: URL,
  deps: CrawlerDeps,
): Promise<string[]> {
  const urls = new Set<string>();

  async function collect(sitemapUrl: string, depth: number) {
    if (depth > 3) return;
    let xml: string;
    try {
      xml = await deps.fetchHtml(sitemapUrl);
    } catch {
      return;
    }
    const locs = parseSitemapLocs(xml);
    if (/<sitemapindex/i.test(xml)) {
      for (const loc of locs) await collect(loc, depth + 1);
    } else {
      for (const loc of locs) urls.add(loc);
    }
  }

  await collect(`${origin.origin}/sitemap.xml`, 0);
  return [...urls];
}

function discoverChildren(
  html: string,
  baseUrl: string,
  origin: URL,
  visited: Set<string>,
): URL[] {
  const result: URL[] = [];
  const seen = new Set<string>();
  for (const link of extractLinks(html, baseUrl)) {
    let url: URL;
    try {
      url = new URL(link);
    } catch {
      continue;
    }
    if (!isSameOrigin(url, origin)) continue;
    if (visited.has(url.href) || seen.has(url.href)) continue;
    seen.add(url.href);
    result.push(url);
  }
  return result;
}

const defaultDeps: CrawlerDeps = {
  async fetchHtml(url) {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "APF-AccessibilityScanner/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  },
  async fetchRobots(origin) {
    const res = await fetch(`${origin}/robots.txt`);
    if (!res.ok) return null;
    return res.text();
  },
  async delay(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  },
};

export async function crawl(
  seed: URL,
  options: CrawlOptions = {},
  deps: CrawlerDeps = defaultDeps,
): Promise<CrawlResult> {
  const maxDepth = options.maxDepth ?? 3;
  const maxPages = options.maxPages ?? 100;
  const delayMs = options.politenessDelayMs ?? 500;
  const userAgent = options.userAgent ?? "APF-AccessibilityScanner/1.0";

  const origin = new URL(seed.origin);
  const log: string[] = [];
  log.push(`checking robots.txt for ${origin.origin}`);
  const disallow = await (async () => {
    try {
      const content = await deps.fetchRobots(origin.origin);
      const rules = content ? parseRobotsDisallow(content, userAgent) : [];
      log.push(rules.length > 0 ? `robots.txt parsed: ${rules.length} disallow rule(s)` : "no robots.txt (or no disallow rules)");
      return rules;
    } catch {
      log.push("robots.txt unavailable — proceeding without it");
      return [];
    }
  })();

  const urls: string[] = [];
  const visited = new Set<string>();

  const sitemapUrls = await fetchSitemapUrls(origin, deps);
  const sitemapUsed = sitemapUrls.length > 0;
  const sitemapUrlCount = sitemapUrls.length;
  log.push(sitemapUsed ? `sitemap.xml found: ${sitemapUrlCount} url(s)` : "no sitemap.xml found — using link crawl");

  const queue: { url: URL; depth: number }[] = [{ url: new URL(seed.href), depth: 0 }];
  if (sitemapUsed) {
    for (const href of sitemapUrls) {
      let url: URL;
      try {
        url = new URL(href);
      } catch {
        continue;
      }
      if (!isSameOrigin(url, origin)) continue;
      if (visited.has(url.href)) continue;
      queue.push({ url, depth: 0 });
    }
  }
  let capped = false;

  while (queue.length > 0) {
    const { url, depth } = queue.shift()!;
    const key = url.href;
    if (visited.has(key)) continue;
    visited.add(key);

    if (!isAllowedByRobots(url, disallow)) {
      log.push(`robots.txt blocks ${url.pathname || "/"} — skipping`);
      continue;
    }

    await deps.delay(delayMs);
    let html: string;
    try {
      log.push(`crawling ${url.href}`);
      html = await deps.fetchHtml(url.href);
    } catch {
      log.push(`crawl failed (unreachable): ${url.href}`);
      continue;
    }

    urls.push(url.href);

    const children = discoverChildren(html, url.href, origin, visited);
    log.push(`${url.pathname || "/"} → ${children.length} link(s)`);

    if (urls.length >= maxPages) {
      if (children.length > 0 || queue.length > 0) capped = true;
      log.push(`crawl cap reached: ${urls.length} page(s) (max ${maxPages})`);
      break;
    }

    if (depth >= maxDepth) {
      if (children.length > 0) capped = true;
      continue;
    }

    for (const child of children) {
      if (urls.length + queue.length < maxPages) {
        queue.push({ url: child, depth: depth + 1 });
      } else {
        capped = true;
        break;
      }
    }
  }

  if (queue.length > 0) capped = true;

  return { urls, pagesScanned: urls.length, partial: capped, sitemapUsed, sitemapUrlCount, log };
}
