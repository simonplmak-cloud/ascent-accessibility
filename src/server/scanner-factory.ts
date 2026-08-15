import { createRequire } from "node:module";
import { chromium, type Browser } from "playwright";
import { scanPage, type ScannerPage, type ScanResult } from "@/lib/scanner";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

export interface PageScanner {
  scan: (url: string, tags: string[]) => Promise<ScanResult>;
  close: () => Promise<void>;
}

async function launchBrowser(): Promise<Browser> {
  const token = process.env.BROWSERLESS_TOKEN;
  if (token) {
    const url = process.env.BROWSERLESS_URL ?? "wss://chrome.browserless.io";
    return chromium.connectOverCDP(`${url}?token=${token}`);
  }
  return chromium.launch();
}

export async function createPageScanner(): Promise<PageScanner> {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  // Inject axe-core before navigation (addInitScript runs via CDP and is not
  // blocked by the target page's Content-Security-Policy).
  await page.addInitScript({ path: axePath });
  return {
    scan: (url: string, tags: string[]) =>
      scanPage(url, tags, page as unknown as ScannerPage),
    close: async () => browser.close(),
  };
}
