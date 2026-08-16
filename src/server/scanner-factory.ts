import { createRequire } from "node:module";
import { chromium, type Browser, type Page } from "playwright";
import { scanPage, type ScannerPage, type ScanResult } from "@/lib/scanner";
import { captureEvidence, type CapturedEvidence } from "@/lib/evidence/screenshot";
import { runIbmScan, type IbmScanOutput } from "@/lib/comparison/ibm";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

export interface PageScanner {
  scan: (url: string, tags: string[]) => Promise<ScanResult>;
  captureEvidence: (result: ScanResult) => Promise<CapturedEvidence>;
  scanIbm: (url: string) => Promise<IbmScanOutput>;
  close: () => Promise<void>;
}

async function launchBrowser(): Promise<Browser> {
  const token = process.env.BROWSERLESS_TOKEN;
  if (token) {
    const url = process.env.BROWSERLESS_URL ?? "wss://chrome.browserless.io";
    return chromium.connectOverCDP(`${url}?token=${token}`);
  }
  // Self-hosted Chromium (runs inside the container). These flags are required
  // for headless Chromium running as root in a Docker container.
  return chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}

// A single long-lived browser shared across all scans. Launching a fresh
// Chromium per worker is memory-prohibitive (a browser ≈ 250MB vs a page ≈ 50MB);
// sharing one browser + one page per worker keeps memory proportional to the
// number of *pages*, not browsers.
let sharedBrowser: Browser | null = null;

async function getSharedBrowser(): Promise<Browser> {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser;
  }
  if (sharedBrowser) {
    try {
      await sharedBrowser.close();
    } catch {
      /* ignore */
    }
    sharedBrowser = null;
  }
  sharedBrowser = await launchBrowser();
  return sharedBrowser;
}

function asScannerPage(page: Page): ScannerPage {
  return {
    goto: (url, options) => page.goto(url, { timeout: options?.timeout }),
    addInitScript: async (options) => {
      await page.addInitScript(options);
    },
    evaluate: (pageFn, arg) =>
      page.evaluate(pageFn as unknown as (a: unknown) => unknown, arg as unknown),
    screenshot: (options) => page.screenshot(options),
    screenshotElement: (selector) => page.locator(selector).first().screenshot(),
  };
}

export async function createPageScanner(): Promise<PageScanner> {
  const browser = await getSharedBrowser();
  const page = await browser.newPage();
  // Inject axe-core before navigation (addInitScript runs via CDP and is not
  // blocked by the target page's Content-Security-Policy).
  await page.addInitScript({ path: axePath });
  const scannerPage = asScannerPage(page);
  return {
    scan: (url: string, tags: string[]) => scanPage(url, tags, scannerPage),
    captureEvidence: (result: ScanResult) => captureEvidence(scannerPage, result),
    scanIbm: (url: string) => runIbmScan(page, url),
    // Close only the page — the browser is shared and stays alive for reuse.
    close: async () => {
      try {
        await page.close();
      } catch {
        /* ignore */
      }
    },
  };
}
