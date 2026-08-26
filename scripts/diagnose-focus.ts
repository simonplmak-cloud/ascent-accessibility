// Reproduces the interaction-scan's EXACT sequence (reflow viewport cycle,
// then the Tab-press trap check) to find why ascent.partners is flagged.
import { chromium } from "playwright";

const SITES = ["https://www.ascent.partners", "https://www.a11yproject.com"];
const REFLOW_WIDTH = 320;

async function main() {
  const browser = await chromium.launch();
  for (const site of SITES) {
    const page = await browser.newPage();
    await page.goto(site, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(300); // SCAN_SETTLE_MS

    // --- exact interaction-scan reflow cycle ---
    const viewport = page.viewportSize();
    console.log(`\n=== ${site} ===`);
    console.log(`viewport before: ${JSON.stringify(viewport)}`);
    try {
      await page.setViewportSize({ width: REFLOW_WIDTH, height: 800 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      console.log(`reflow overflow @320px: ${overflow}`);
    } catch (e) {
      console.log(`reflow check error: ${(e as Error).message}`);
    } finally {
      if (viewport) await page.setViewportSize(viewport).catch(() => {});
    }
    console.log(`viewport after restore: ${JSON.stringify(page.viewportSize())}`);

    // --- exact keyboard-trap check ---
    const focusable = await page.evaluate(
      () =>
        document.querySelectorAll(
          "a[href], button, input:not([type='hidden']), select, textarea, [tabindex]:not([tabindex='-1'])",
        ).length,
    );
    console.log(`focusable=${focusable}`);
    if (focusable > 0) {
      await page.evaluate(() => {
        const a = document.activeElement;
        if (a instanceof HTMLElement) a.blur();
      });
      let stuck = false;
      let prev = "";
      let same = 0;
      for (let i = 0; i < Math.min(focusable + 5, 20); i++) {
        await page.keyboard.press("Tab");
        const cur = await page.evaluate(() => {
          const a = document.activeElement;
          if (!a || a === document.body || a === document.documentElement) return "";
          return `${a.tagName}#${a.getAttribute("id") || ""}`;
        });
        const marker = cur === "" ? "(body)" : cur === prev ? " *SAME*" : "";
        console.log(`  tab${String(i).padStart(2)}: ${cur || "(body/none)"}${marker}`);
        if (cur === "") {
          same = 0;
          prev = "";
          continue;
        }
        if (cur === prev) same += 1;
        else same = 0;
        prev = cur;
        if (same >= 5) {
          stuck = true;
          break;
        }
      }
      console.log(`RESULT: stuck=${stuck}`);
    }
    await page.close();
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
