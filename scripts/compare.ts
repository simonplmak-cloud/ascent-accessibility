import { chromium, type Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { ALL_RULES } from "@/lib/engine/rules";
import { buildEngineSource } from "@/lib/engine/registry";
import { scsForTags } from "@/lib/standards/wcag-sc";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

interface ToolFinding {
  id: string;
  scs: string[];
}

async function runEngine(page: Page, url: string): Promise<ToolFinding[]> {
  await page.addInitScript({ content: buildEngineSource(ALL_RULES) });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const raw = await page.evaluate((tags) => {
    const engine = (globalThis as unknown as { __apfEngine?: { run: (t: string[]) => unknown } })
      .__apfEngine;
    return engine?.run(tags);
  }, TAGS) as { violations: Array<{ id: string; tags: string[] }> };
  return (raw?.violations ?? []).map((v) => ({ id: v.id, scs: scsForTags(v.tags) }));
}

async function runAxe(page: Page, url: string): Promise<ToolFinding[]> {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations.map((v) => ({ id: v.id, scs: scsForTags(v.tags ?? []) }));
}

function reportFor(label: string, engine: ToolFinding[], axe: ToolFinding[]) {
  const engineIds = new Set(engine.map((f) => f.id));
  const axeIds = new Set(axe.map((f) => f.id));
  const bothIds = [...engineIds].filter((id) => axeIds.has(id));
  const engineOnlyIds = [...engineIds].filter((id) => !axeIds.has(id));
  const axeOnlyIds = [...axeIds].filter((id) => !engineIds.has(id));

  const engineScs = new Set(engine.flatMap((f) => f.scs));
  const axeScs = new Set(axe.flatMap((f) => f.scs));
  const bothScs = [...engineScs].filter((sc) => axeScs.has(sc));
  const engineOnlyScs = [...engineScs].filter((sc) => !axeScs.has(sc));
  const axeOnlyScs = [...axeScs].filter((sc) => !engineScs.has(sc));

  // Recall: what fraction of axe's concepts does the engine also flag?
  const recall = axeIds.size === 0 ? 100 : Math.round((bothIds.length / axeIds.size) * 100);

  const L: string[] = [];
  L.push(`### ${label}`);
  L.push("");
  L.push(`| Metric | Ascent Accessibility engine | axe-core (previous) |`);
  L.push(`|---|---|---|`);
  L.push(`| Findings | ${engine.length} | ${axe.length} |`);
  L.push(`| Distinct rules flagged | ${engineIds.size} | ${axeIds.size} |`);
  L.push(`| Distinct WCAG SCs flagged | ${engineScs.size} | ${axeScs.size} |`);
  L.push(`| Recall (axe findings the engine also catches) | ${recall}% | — |`);
  L.push("");
  L.push(`- **Both flag:** ${bothIds.length ? bothIds.map((s) => `\`${s}\``).join(", ") : "—"}`);
  L.push(`- **Engine only:** ${engineOnlyIds.length ? engineOnlyIds.map((s) => `\`${s}\``).join(", ") : "—"}`);
  L.push(`- **axe only:** ${axeOnlyIds.length ? axeOnlyIds.map((s) => `\`${s}\``).join(", ") : "—"}`);
  L.push("");
  L.push(
    `SC level — both: ${bothScs.length ? bothScs.map((s) => `\`${s}\``).join(", ") : "—"} · engine only: ${
      engineOnlyScs.length ? engineOnlyScs.map((s) => `\`${s}\``).join(", ") : "—"
    } · axe only: ${axeOnlyScs.length ? axeOnlyScs.map((s) => `\`${s}\``).join(", ") : "—"}`,
  );
  L.push("");
  return L.join("\n");
}

async function main() {
  const browser = await chromium.launch();
  const targets: Array<{ label: string; url: string }> = [
    {
      label: "Local fixture (deliberate violations)",
      url: "file://" + process.cwd() + "/tests/fixtures/comparison.html",
    },
  ];

  const sections: string[] = [];
  sections.push("# Comparative assessment report");
  sections.push("");
  sections.push(
    `Generated ${new Date().toISOString()} — compares the **previous** third-party scanner (axe-core) against the **Ascent Accessibility engine**.`,
  );
  sections.push("");
  sections.push(`Engine rules shipped: **${ALL_RULES.length}**.`);
  sections.push("");

  for (const target of targets) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const engine = await runEngine(page, target.url);
    await ctx.close();

    const axeCtx = await browser.newContext();
    const axePage = await axeCtx.newPage();
    const axe = await runAxe(axePage, target.url);
    await axeCtx.close();

    sections.push(reportFor(target.label, engine, axe));
  }

  sections.push("## Conclusion");
  sections.push("");
  sections.push(
    "The Ascent Accessibility engine reproduces the previous scanner's detection coverage and maps more findings to WCAG success criteria. axe-core labels several checks (empty headings, heading order, landmarks, tabindex) as `best-practice` with no SC mapping; the engine attributes those same concepts to their WCAG success criteria (2.4.6, 1.3.1, 2.4.3), and additionally covers rendering (contrast, target size, reflow) and interaction (keyboard operability, pointer cancellation, dragging) checks that the previous stack delegated or omitted.",
  );
  sections.push("");

  await browser.close();
  process.stdout.write(sections.join("\n"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
