import { ALL_RULES } from "@/lib/engine/rules";
import { scsForTags, WCAG_SCS } from "@/lib/standards/wcag-sc";
import { createRequire } from "node:module";

const AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

interface AxeRuleMeta {
  id: string;
  tags?: string[];
}

const require = createRequire(import.meta.url);

function loadAxe(): { getRules: () => AxeRuleMeta[] } {
  const axe = require("../node_modules/.pnpm/axe-core@4.13.0/node_modules/axe-core/axe.js") as {
    getRules: () => AxeRuleMeta[];
  };
  return axe;
}

function getAxeCoverage(axeCore: { getRules: () => AxeRuleMeta[] }) {
  const rules = axeCore.getRules();
  const scs = new Set<string>();
  const bestPractice: string[] = [];
  for (const rule of rules) {
    const mapped = scsForTags(rule.tags ?? []);
    if (mapped.length === 0) bestPractice.push(rule.id);
    for (const sc of mapped) scs.add(sc);
  }
  return { ruleCount: rules.length, scs, bestPractice };
}

async function main() {
  const axeCore = loadAxe();
  const engineScs = new Set<string>();
  for (const rule of ALL_RULES) for (const sc of rule.wcagSc) engineScs.add(sc);

  const axe = getAxeCoverage(axeCore);

  const all = WCAG_SCS.map((s) => s.num);
  const both = all.filter((sc) => engineScs.has(sc) && axe.scs.has(sc));
  const engineOnly = all.filter((sc) => engineScs.has(sc) && !axe.scs.has(sc));
  const axeOnly = all.filter((sc) => !engineScs.has(sc) && axe.scs.has(sc));
  const neither = all.filter((sc) => !engineScs.has(sc) && !axe.scs.has(sc));

  const lines: string[] = [];
  lines.push(`engine_rules=${ALL_RULES.length}`);
  lines.push(`engine_scs=${engineScs.size}`);
  lines.push(`axe_rules=${axe.ruleCount}`);
  lines.push(`axe_scs=${axe.scs.size}`);
  lines.push(`axe_best_practice_rules=${axe.bestPractice.length}`);
  lines.push(`sc_both=${both.length}`);
  lines.push(`sc_engine_only=${engineOnly.length}`);
  lines.push(`sc_axe_only=${axeOnly.length}`);
  lines.push(`sc_neither=${neither.length}`);
  lines.push("---both---");
  lines.push(both.join(" "));
  lines.push("---engine_only---");
  lines.push(engineOnly.join(" "));
  lines.push("---axe_only---");
  lines.push(axeOnly.join(" "));
  lines.push("---neither---");
  lines.push(neither.join(" "));
  lines.push("---axe_best_practice_sample---");
  lines.push(axe.bestPractice.slice(0, 80).join(" "));

  process.stdout.write(lines.join("\n"));
}

main();
