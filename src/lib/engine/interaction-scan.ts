import type { Page } from "playwright";
import type { ScanViolation } from "@/lib/scanner";

const REFLOW_WIDTH = 320;

function makeViolation(
  id: string,
  description: string,
  tags: string[],
): ScanViolation {
  return {
    id,
    impact: "serious",
    description,
    help: description,
    helpUrl: "",
    tags,
    nodes: [{ html: "", target: [""], failureSummary: description }],
    nodeCount: 1,
  };
}

export async function runInteractionScan(page: Page): Promise<ScanViolation[]> {
  const violations: ScanViolation[] = [];
  const viewport = page.viewportSize();

  try {
    await page.setViewportSize({ width: REFLOW_WIDTH, height: 800 });
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return de.scrollWidth > window.innerWidth + 1;
    });
    if (overflow) {
      violations.push(
        makeViolation("reflow", "content overflows horizontally at a 320px viewport", ["wcag2aa", "wcag1410"]),
      );
    }
  } catch {
    /* reflow check unavailable */
  } finally {
    if (viewport) await page.setViewportSize(viewport).catch(() => {});
  }

  try {
    const focusable = await page.evaluate(
      () =>
        document.querySelectorAll(
          "a[href], button, input:not([type='hidden']), select, textarea, [tabindex]:not([tabindex='-1'])",
        ).length,
    );
    if (focusable > 0) {
      await page.evaluate(() => {
        const a = document.activeElement;
        if (a instanceof HTMLElement) a.blur();
      });
      // Track the DISTINCT elements focus lands on. A real trap means Tab only
      // ever reaches one element despite the page having many focusable ones.
      // (Comparing `${tagName}#${id}` alone was a false positive: every <a>
      // without an id looked identical.)
      const seen = new Set<string>();
      for (let i = 0; i < Math.min(focusable + 5, 20); i++) {
        await page.keyboard.press("Tab");
        const cur = await page.evaluate(() => {
          const a = document.activeElement;
          if (!a || a === document.body || a === document.documentElement) return "";
          const text = (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
          return `${a.tagName}|${a.getAttribute("id") || ""}|${a.getAttribute("href") || ""}|${text}`;
        });
        if (cur) seen.add(cur);
      }
      if (focusable > 1 && seen.size === 1) {
        violations.push(
          makeViolation("no-keyboard-trap", "keyboard focus appears trapped", ["wcag2a", "wcag212"]),
        );
      }
    }
  } catch {
    /* keyboard check unavailable */
  }

  return violations;
}
