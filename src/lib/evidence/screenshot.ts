import type { ScannerPage, ScanResult } from "@/lib/scanner";

export interface ElementCapture {
  ruleId: string;
  instanceIndex: number;
  buffer: Buffer;
  mime: string;
}

export interface CapturedEvidence {
  fullPage: Buffer;
  fullPageMime: string;
  elements: ElementCapture[];
}

async function highlightTargets(page: ScannerPage, selectors: string[]): Promise<void> {
  await page.evaluate((sels) => {
    const cls = "apf-a11y-outline";
    document.querySelectorAll("[data-apf-highlight]").forEach((el) => el.remove());
    document.querySelectorAll("." + cls).forEach((el) => el.classList.remove(cls));
    const style = document.createElement("style");
    style.setAttribute("data-apf-highlight", "true");
    style.textContent = "." + cls + " { outline: 3px solid #ff7b72 !important; outline-offset: 1px; }";
    document.head.appendChild(style);
    for (const sel of sels) {
      try {
        document.querySelectorAll(sel).forEach((el) => el.classList.add(cls));
      } catch {
        /* invalid selector — skip */
      }
    }
  }, selectors);
}

export async function captureEvidence(
  page: ScannerPage,
  result: ScanResult,
  opts: { elementLimit?: number } = {},
): Promise<CapturedEvidence> {
  const elementLimit =
    opts.elementLimit ?? Number(process.env.EVIDENCE_ELEMENT_LIMIT ?? "1");

  const selectors = result.violations.flatMap((v) =>
    v.nodes.map((n) => n.target[0]).filter((t): t is string => Boolean(t)),
  );
  await highlightTargets(page, selectors);

  // Full-page screenshots are slow on heavy pages (~35s) and can dominate a
  // scan. Default to a fast viewport capture; opt into the complete-page
  // evidence with EVIDENCE_FULLPAGE_SCREENSHOT=true.
  const fullPage = await page.screenshot({
    type: "jpeg",
    quality: 70,
    ...(process.env.EVIDENCE_FULLPAGE_SCREENSHOT === "true" ? { fullPage: true } : {}),
  });

  const elements: ElementCapture[] = [];
  let count = 0;
  for (const violation of result.violations) {
    for (let i = 0; i < violation.nodes.length && count < elementLimit; i++) {
      const target = violation.nodes[i]?.target[0];
      if (!target) continue;
      try {
        const buffer = await page.screenshotElement(target);
        elements.push({ ruleId: violation.id, instanceIndex: i, buffer, mime: "image/png" });
        count += 1;
      } catch {
        /* selector did not resolve — skip */
      }
    }
  }

  return { fullPage, fullPageMime: "image/jpeg", elements };
}
