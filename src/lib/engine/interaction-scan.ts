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
      let stuck = false;
      let prev = "";
      let same = 0;
      for (let i = 0; i < Math.min(focusable + 5, 60); i++) {
        await page.keyboard.press("Tab");
        const cur = await page.evaluate(() => {
          const a = document.activeElement;
          return a ? `${a.tagName}#${a.getAttribute("id") || ""}` : "none";
        });
        if (cur === prev) same += 1;
        else same = 0;
        prev = cur;
        if (same >= 5) {
          stuck = true;
          break;
        }
      }
      if (stuck) {
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
