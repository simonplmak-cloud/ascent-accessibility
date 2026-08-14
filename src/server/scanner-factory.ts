import { createRequire } from "node:module";
import { chromium } from "playwright";
import { scanPage, type ScannerPage } from "@/lib/scanner";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

export async function createPageScanner() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  return {
    scan: (url: string, tags: string[]) =>
      scanPage(url, tags, page as unknown as ScannerPage, axePath),
    close: async () => browser.close(),
  };
}
