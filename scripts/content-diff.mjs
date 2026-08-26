#!/usr/bin/env node
// Content-rewrite meter: word-diffs the English website copy in
// messages/en.json against a baseline git commit, per namespace, and reports
// the aggregate % of words changed or removed. Run: `node scripts/content-diff.mjs [baseline]`.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const baseline = process.argv[2] ?? "8995a2b";
const SCOPE = [
  "nav", "home", "about", "primer", "plans", "forGovernment",
  "forNgos", "esg", "methodology", "compliance", "guidesIndex", "remediation",
  "standards", "glossary", "roadmap", "contactPage", "faqPage", "donate",
  "humanReviewPage", "footer",
];

function words(s) {
  return (String(s).match(/[A-Za-z0-9'-]+/g) ?? []).length;
}

function flatten(obj, out = {}) {
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (typeof v === "string") out[k] = v;
    else if (v && typeof v === "object") flatten(v, out);
  }
  return out;
}

function loadEn(rev) {
  if (rev === "WORKING") {
    return JSON.parse(readFileSync("messages/en.json", "utf8"));
  }
  try {
    return JSON.parse(execSync(`git show ${rev}:messages/en.json`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
  } catch {
    return JSON.parse(readFileSync("messages/en.json", "utf8"));
  }
}

const beforeAll = flatten(loadEn(baseline));
const afterAll = flatten(loadEn("WORKING"));

let beforeWords = 0;
let changedWords = 0;
let removedWords = 0;
let nsCount = 0;

const rows = [];
for (const ns of SCOPE) {
  const b = flatten(loadEn(baseline)[ns] ?? {});
  const a = flatten(loadEn("WORKING")[ns] ?? {});
  let bW = 0, aW = 0;
  for (const v of Object.values(b)) bW += words(v);
  for (const v of Object.values(a)) aW += words(v);
  // changed = words not verbatim-identical across the two key sets
  let ch = 0;
  const seen = new Set();
  for (const [k, v] of Object.entries(b)) {
    seen.add(k);
    if (a[k] !== v) ch += words(v);
  }
  for (const [k, v] of Object.entries(a)) {
    if (!seen.has(k)) ch += words(v);
  }
  const rem = Math.max(0, bW - aW);
  beforeWords += bW;
  changedWords += ch;
  removedWords += Math.max(0, rem);
  nsCount += 1;
  rows.push({ ns, before: bW, after: aW, changed: ch });
}

const totalChanged = changedWords + removedWords;
const pct = beforeWords === 0 ? 0 : Math.round((totalChanged / beforeWords) * 1000) / 10;

console.log("Baseline:", baseline, "→ HEAD");
console.table(rows.map((r) => ({ ns: r.ns, before: r.before, after: r.after, changed: r.changed })));
console.log(`\nScoped English copy: ${beforeWords} words before → ${changedWords} changed + ${removedWords} removed = ${totalChanged} affected (${pct}%)`);
console.log(pct >= 75 ? "✓ meets ≥75% target" : "✗ below 75% target");
