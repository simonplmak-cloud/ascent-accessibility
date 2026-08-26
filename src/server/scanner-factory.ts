import { chromium, type Browser, type Page } from "playwright";
import { type ScannerPage, type ScanResult, type RuleSummary, type ScanViolation } from "@/lib/scanner";
import { captureEvidence, type CapturedEvidence } from "@/lib/evidence/screenshot";
import { runEngine } from "@/lib/engine/runner";
import { runInteractionScan } from "@/lib/engine/interaction-scan";
import { ALL_RULES } from "@/lib/engine/rules";
import { buildEngineSource } from "@/lib/engine/registry";

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
  const context = await browser.newContext();
  const page = await context.newPage();
  // Inject the Ascent Accessibility engine before navigation (addInitScript runs via
  // CDP and is not blocked by the target page's Content-Security-Policy).
  await page.addInitScript({ content: buildEngineSource(ALL_RULES) });
  const scannerPage = asScannerPage(page);
  let disposed = false;

  return {
    scan: (url: string, tags: string[]) => runEngine(url, tags, scannerPage),
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
