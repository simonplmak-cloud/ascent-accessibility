// Screen-reader-equivalent test: dump the browser accessibility tree (the data a
// screen reader consumes) for key pages, as a readable "announcement transcript".
// Run: node scripts/a11y/ax-tree.mjs  (PLAYWRIGHT_BASE_URL optional)
import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://accessibility.ascent.partners";
const PAGES = [
  "/",
  "/standards",
  "/pricing",
  "/guides",
  "/methodology",
  "/glossary",
  "/about",
  "/for-government",
  "/sign-in",
];

// Roles a screen reader announces/navigates by. Everything else is collapsed.
const ANNOUNCED_ROLES = new Set([
  "RootWebArea", "banner", "main", "navigation", "contentinfo", "complementary",
  "region", "search", "form", "heading", "link", "button", "img", "textbox",
  "combobox", "listbox", "option", "checkbox", "radio", "searchbox", "dialog",
  "list", "listitem", "table", "cell", "columnheader", "rowheader",
]);

async function getAXNodes(page) {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send("Accessibility.getFullAXTree");
  return nodes;
}

function outline(nodes) {
  const byId = new Map(nodes.map((n) => [n.nodeId, n]));
  const lines = [];
  const walk = (id, depth) => {
    const n = byId.get(id);
    if (!n) return;
    const role = n.role?.value || "?";
    const name = (n.name?.value || "").trim();
    if (role === "RootWebArea") {
      for (const c of n.childIds || []) walk(c, depth + 1);
      return;
    }
    if (ANNOUNCED_ROLES.has(role)) {
      const pad = "  ".repeat(Math.min(depth, 12));
      lines.push(`${pad}${role}${name ? ` : "${name.slice(0, 80)}"` : ""}`);
    }
    for (const c of n.childIds || []) walk(c, depth);
  };
  const root = nodes.find((n) => n.role?.value === "RootWebArea");
  if (root) walk(root.nodeId, 0);
  return lines;
}

// Links/buttons/form fields with EMPTY accessible names = the real SR failures.
function unnamed(nodes) {
  const out = [];
  for (const n of nodes) {
    const role = n.role?.value || "";
    const name = (n.name?.value || "").trim();
    if ((role === "link" || role === "button" || role === "textbox" || role === "combobox") && !name) {
      out.push(`  ⚠ ${role} with no accessible name (node ${n.nodeId})`);
    }
  }
  return out;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const path of PAGES) {
    const url = BASE + path;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    } catch {
      // keep going on timeout
    }
    const nodes = await getAXNodes(page);
    console.log(`\n\n================ ${path} ================`);
    console.log(`title: ${await page.title()}`);
    console.log("--- announcement outline (landmarks + headings + named controls) ---");
    for (const line of outline(nodes)) console.log(line);
    const missing = unnamed(nodes);
    console.log("--- unnamed interactive controls ---");
    console.log(missing.length ? missing.join("\n") : "  (none)");
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
