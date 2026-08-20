import { chromium } from "playwright";
import { parseVerdicts } from "../src/lib/ai-review/parse";

const KEY = process.env.AUDIT_AI_KEY ?? "";
const PROMPT = [
  "You are an accessibility auditor reviewing a screenshot of a rendered web page.",
  "For each WCAG success criterion below, decide PASS, FAIL, or NEEDS_REVIEW based only on what you can see.",
  "If you cannot determine the outcome with certainty, return NEEDS_REVIEW rather than guessing — a wrong PASS is worse than an unresolved item.",
  "Return confidence from 0.0 to 1.0. Only PASS or FAIL at confidence 0.8 or above.",
  "",
  "Success criteria to assess:",
  "- 1.1.1 Non-text Content: Check that every image, icon, and non-text element has a meaningful text alternative; decorative images are hidden from assistive technology.",
  "- 1.4.3 Contrast (Minimum): text contrast is at least 4.5:1",
  "- 1.4.11 Non-text Contrast: UI component boundaries meet 3:1",
  "- 2.4.4 Link Purpose (In Context): Confirm each link's purpose is clear from its text in context.",
  "- 3.1.1 Language of Page: Confirm the page has a correct lang attribute.",
  "",
  'Respond ONLY as JSON: {"verdicts":[{"sc":"1.1.1","verdict":"pass"|"fail"|"needs-review","confidence":0.0,"reasoning":"..."}]}',
].join("\n");

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://example.com", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);
  const shot = await page.screenshot({ type: "jpeg", quality: 60 });
  await browser.close();

  const res = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: "qwen-vl-plus", temperature: 0, max_tokens: 2048,
      messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: `data:image/jpeg;base64,${shot.toString("base64")}` } }, { type: "text", text: PROMPT }] }],
      response_format: { type: "json_object" } }),
    signal: AbortSignal.timeout(120_000),
  });
  const json = await res.json() as any;
  return json?.choices?.[0]?.message?.content as string;
}

async function main() {
  for (let i = 0; i < 6; i++) {
    const content = await run();
    const parsed = parseVerdicts(content);
    console.log(`run ${i}: len=${content.length} parsed=${parsed ? parsed.length + " verdicts" : "NULL"}`);
    if (!parsed && content.length > 2000) {
      console.log("  tail repr:", JSON.stringify(content.slice(-120)));
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
