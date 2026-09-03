import { chromium, type Browser, type Page } from "playwright";
import { type ScannerPage, type ScanResult, type RuleSummary, type ScanViolation } from "@/lib/scanner";
import { captureEvidence, type CapturedEvidence } from "@/lib/evidence/screenshot";
import { runEngine } from "@/lib/engine/runner";
import { runInteractionScan } from "@/lib/engine/interaction-scan";
import { ALL_RULES } from "@/lib/engine/rules";
import { buildEngineSource } from "@/lib/engine/registry";
import type { CrawlerDeps } from "@/lib/crawler";

export interface PageScanner {
  scan: (url: string, tags: string[]) => Promise<ScanResult>;
  captureEvidence: (result: ScanResult) => Promise<CapturedEvidence>;
  screenshotPage: () => Promise<Buffer>;
  snapshotPage: () => Promise<{ html: string; screenshot: Buffer }>;
  interactionScan: () => Promise<{ violations: ScanViolation[]; passes: RuleSummary[] }>;
  evaluate: (fn: (arg: unknown) => unknown, arg?: unknown) => Promise<unknown>;
  pageTitle: () => Promise<string>;
  detectPageLanguage: () => Promise<{ lang: string | null; text: string }>;
  close: () => Promise<void>;
  discard: () => Promise<void>;
}

// Mask the most obvious automation signals. Injected via addInitScript (CDP
// level), so it runs before any page script — the exact thing Cloudflare-style
// challenges probe. The engine injection rides along the same channel.
//
// Namespace safety: the in-house engine owns `window.__apf*`; this script only
// patches navigator/window/chrome/WebGL and never touches __apf*.
const STEALTH_SOURCE = `
(() => {
  try {
    // navigator.webdriver — the #1 automation flag (Cloudflare/DataDome probe it).
    Object.defineProperty(Navigator.prototype, "webdriver", {
      get: () => undefined,
      configurable: true,
    });
    // navigator.languages — headless can report a bare list.
    Object.defineProperty(Navigator.prototype, "languages", {
      get: () => ["en-US", "en"],
      configurable: true,
    });
    // navigator.plugins — an empty PluginArray is a headless tell.
    Object.defineProperty(Navigator.prototype, "plugins", {
      get: () => [1, 2, 3, 4, 5],
      configurable: true,
    });
    // window.chrome — real Chrome exposes chrome.runtime; headless may not.
    window.chrome = window.chrome || { runtime: {} };
    // navigator.permissions.query — some challenges gate on notification state.
    const perms = window.navigator.permissions;
    const originalQuery = perms && perms.query ? perms.query.bind(perms) : null;
    if (originalQuery) {
      Object.defineProperty(window.navigator.permissions, "query", {
        value: (parameters) =>
          parameters && parameters.name === "notifications"
            ? Promise.resolve({ state: Notification.permission })
            : originalQuery(parameters),
        configurable: true,
      });
    }
    // WebGL vendor/renderer — headless reports "Google"/"Google SwiftShader".
    const getParam = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (param) {
      if (param === 37445) return "Intel Inc.";              // UNMASKED_VENDOR_WEBGL
      if (param === 37446) return "Intel Iris OpenGL Engine"; // UNMASKED_RENDERER_WEBGL
      return getParam.call(this, param);
    };
    // window.outerWidth/outerHeight — headless reports 0.
    Object.defineProperty(window, "outerWidth", {
      get: () => window.innerWidth,
      configurable: true,
    });
    Object.defineProperty(window, "outerHeight", {
      get: () => window.innerHeight,
      configurable: true,
    });
  } catch (e) {
    /* ignore — stealth is best-effort and must never break the page */
  }
})();
`;

// A realistic browser UA for the page context (override via SCAN_USER_AGENT).
const BROWSER_USER_AGENT =
  process.env.SCAN_USER_AGENT ??
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function launchBrowser(): Promise<Browser> {
  const token = process.env.BROWSERLESS_TOKEN;
  if (token) {
    const url = process.env.BROWSERLESS_URL ?? "wss://chrome.browserless.io";
    return chromium.connectOverCDP(`${url}?token=${token}`);
  }
  // Self-hosted Chromium (runs inside the container). These flags are required
  // for headless Chromium running as root in a Docker container. `--disable-gpu`
  // and the V8 heap cap keep memory bounded so the box isn't OOM-killed (which
  // would reboot the machine and force a cold start).
  return chromium.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-blink-features=AutomationControlled",
      "--no-first-run",
      "--no-default-browser-check",
      "--js-flags=--max-old-space-size=512",
    ],
  });
}

// A pool of idle browsers reused across assessments, so a scan doesn't pay the
// ~2-5s Chromium launch cost each time. Each scan still gets a fresh context
// (cookies/storage don't leak between sites); the browser process lives on.
const idleBrowsers: Browser[] = [];
const MAX_POOL_SIZE = Number(process.env.WORKER_BROWSER_POOL_SIZE ?? 4);

async function acquireBrowser(): Promise<Browser> {
  while (idleBrowsers.length > 0) {
    const browser = idleBrowsers.pop()!;
    if (browser.isConnected()) return browser;
    try {
      await browser.close();
    } catch {
      /* ignore */
    }
  }
  return launchBrowser();
}

function releaseBrowser(browser: Browser): void {
  if (idleBrowsers.length < MAX_POOL_SIZE && browser.isConnected()) {
    idleBrowsers.push(browser);
  } else {
    void browser.close().catch(() => {});
  }
}

async function discardBrowser(browser: Browser): Promise<void> {
  try {
    await browser.close();
  } catch {
    /* ignore */
  }
}

function asScannerPage(page: Page): ScannerPage {
  return {
    goto: (url, options) =>
      page.goto(url, { timeout: options?.timeout, waitUntil: options?.waitUntil }),
    addInitScript: async (options) => {
      await page.addInitScript(options);
    },
    evaluate: (pageFn, arg) =>
      page.evaluate(pageFn as unknown as (a: unknown) => unknown, arg as unknown),
    content: () => page.content(),
    screenshot: (options) => page.screenshot(options),
    screenshotElement: (selector) =>
      page.locator(selector).first().screenshot({ timeout: 5000 }),
  };
}

// Pre-warm the browser pool at worker startup so the first scan after a restart
// doesn't pay the cold Chromium launch cost.
export async function warmBrowserPool(): Promise<void> {
  await Promise.all(
    Array.from({ length: MAX_POOL_SIZE }, async () => {
      try {
        idleBrowsers.push(await launchBrowser());
      } catch {
        /* ignore — the pool fills on demand */
      }
    }),
  );
}

export async function createPageScanner(): Promise<PageScanner> {
  const browser = await acquireBrowser();
  const context = await browser.newContext({ userAgent: BROWSER_USER_AGENT });
  const page = await context.newPage();
  // Optional verification header allowlist (AC-5): a site owner can whitelist
  // the scanner by configuring SCAN_VERIFY_HEADER/SCAN_VERIFY_VALUE. The header
  // is attached ONLY to same-origin requests (the target's own origin), never
  // to cross-origin subresources or redirects to other hosts.
  const verifyHeader = process.env.SCAN_VERIFY_HEADER;
  const verifyValue = process.env.SCAN_VERIFY_VALUE;
  let targetOrigin: string | null = null;
  if (verifyHeader && verifyValue) {
    await page.route(
      (url) => targetOrigin !== null && url.origin === targetOrigin,
      async (route) => {
        const headers = { ...route.request().headers() };
        headers[verifyHeader] = verifyValue;
        await route.continue({ headers });
      },
    );
  }
  // Inject the Ascent Accessibility engine before navigation (addInitScript runs via
  // CDP and is not blocked by the target page's Content-Security-Policy).
  await page.addInitScript({ content: buildEngineSource(ALL_RULES) });
  await page.addInitScript({ content: STEALTH_SOURCE });
  const scannerPage = asScannerPage(page);
  let disposed = false;

  return {
    scan: (url: string, tags: string[]) => {
      targetOrigin = new URL(url).origin;
      return runEngine(url, tags, scannerPage);
    },
    captureEvidence: (result: ScanResult) => captureEvidence(scannerPage, result),
    screenshotPage: () => page.screenshot({ type: "jpeg", quality: 60 }),
    snapshotPage: async () => ({
      html: await page.content(),
      screenshot: await page.screenshot({ type: "jpeg", quality: 60 }),
    }),
    interactionScan: () => runInteractionScan(page),
    // Run an arbitrary in-page function (used by the agentic AI review tools).
    evaluate: (fn: (arg: unknown) => unknown, arg?: unknown) =>
      page.evaluate(fn as never, arg as never),
    pageTitle: () => page.title(),
    // Sample the declared lang + body text for best-effort language detection.
    detectPageLanguage: () =>
      page.evaluate(() => ({
        lang: document.documentElement.getAttribute("lang"),
        text: (document.body?.innerText ?? "").slice(0, 5000),
      })) as Promise<{ lang: string | null; text: string }>,
    // Normal completion: close the context and return the browser to the pool.
    close: async () => {
      if (disposed) return;
      disposed = true;
      try {
        await context.close();
      } catch {
        /* ignore */
      }
      releaseBrowser(browser);
    },
    // Crash/timeout: tear the browser down entirely — don't pool a broken one.
    discard: async () => {
      if (disposed) return;
      disposed = true;
      try {
        await context.close();
      } catch {
        /* ignore */
      }
      await discardBrowser(browser);
    },
  };
}

export interface BrowserCrawler {
  deps: CrawlerDeps;
  close: () => Promise<void>;
}

// A real-browser crawler: the same headless Chrome that powers the scan engine,
// used to fetch pages + robots.txt through a real browser context. A real Chrome
// renders JavaScript and carries a genuine browser fingerprint, so it passes most
// WAFs that block the raw `fetch` crawler. Single page → serial by design; call
// crawl(..., { crawlConcurrency: 1 }, deps).
export async function createBrowserCrawler(): Promise<BrowserCrawler> {
  const browser = await acquireBrowser();
  const context = await browser.newContext({ userAgent: BROWSER_USER_AGENT });
  const page = await context.newPage();
  await page.addInitScript({ content: STEALTH_SOURCE });

  const fetchHtml = async (url: string): Promise<string> => {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    const status = res?.status() ?? 0;
    if (status >= 400) throw new Error(`HTTP ${status}`);
    return page.content();
  };

  const fetchRobots = async (origin: string): Promise<string | null> => {
    try {
      const res = await page.goto(`${origin}/robots.txt`, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      const status = res?.status() ?? 0;
      if (status >= 400) return null;
      const body = await page.evaluate(() => document.body?.innerText ?? "");
      return body || null;
    } catch {
      return null;
    }
  };

  const delay = async (ms: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  };

  return {
    deps: { fetchHtml, fetchRobots, delay },
    close: async () => {
      try {
        await context.close();
      } catch {
        /* ignore */
      }
      releaseBrowser(browser);
    },
  };
}
