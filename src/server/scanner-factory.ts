import { createRequire } from "node:module";
import { chromium, type Browser } from "playwright";
import { scanPage, type ScannerPage } from "@/lib/scanner";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const sparticuz = (await import("@sparticuz/chromium")).default;
    return chromium.launch({
      args: sparticuz.args,
      executablePath: await sparticuz.executablePath(),
      headless: true,
    });
  }
  return chromium.launch();
}

export async function createPageScanner() {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  return {
    scan: (url: string, tags: string[]) =>
      scanPage(url, tags, page as unknown as ScannerPage, axePath),
    close: async () => browser.close(),
  };
}
