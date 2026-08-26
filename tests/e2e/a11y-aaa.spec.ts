import { expect, test } from "@playwright/test";

// AAA (WCAG 2.1 1.4.6): normal text requires a 7:1 contrast ratio. The site
// targets AAA; the dimmest text class is `text-terminal-muted`, so verifying it
// meets 7:1 covers all lighter/higher-contrast text on the page.
const pages = [
  { path: "/", name: "landing" },
  { path: "/about", name: "about" },
  { path: "/standards", name: "standards" },
  { path: "/methodology", name: "methodology" },
];

function contrastScript() {
  function lum(rgb: number[]): number {
    const f = (c: number) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const r = f(rgb[0] ?? 0);
    const g = f(rgb[1] ?? 0);
    const b = f(rgb[2] ?? 0);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function ratio(fg: string, bg: string): number {
    const f = lum(fg.match(/\d+/g)!.map(Number));
    const b = lum(bg.match(/\d+/g)!.map(Number));
    return (Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05);
  }
  function effectiveBg(el: Element): string {
    let e: Element | null = el;
    while (e) {
      const c = getComputedStyle(e).backgroundColor;
      if (c && c !== "transparent" && !c.includes("rgba(0, 0, 0, 0)")) return c;
      e = e.parentElement;
    }
    return "rgb(255, 255, 255)";
  }
  const failures: Array<{ text: string; ratio: number }> = [];
  document
    .querySelectorAll("p, li, h2, h3, a, span, dt, dd, th, td, label")
    .forEach((el) => {
      const text = (el.textContent ?? "").trim();
      if (!text || text.length < 4) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") return;
      const r = ratio(cs.color, effectiveBg(el));
      if (r < 7) failures.push({ text: text.slice(0, 40), ratio: Math.round(r * 100) / 100 });
    });
  return failures.slice(0, 10);
}

for (const target of pages) {
  test(`${target.name} text meets AAA contrast (≥7:1)`, async ({ page }) => {
    await page.goto(target.path);
    const failures = await page.evaluate(contrastScript);
    expect(failures).toEqual([]);
  });
}
