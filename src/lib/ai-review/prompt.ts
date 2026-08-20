import { getManualTest } from "@/lib/standards/sc-manual-tests";
import { getSc } from "@/lib/standards/wcag-sc";

export interface TriageSc {
  sc: string;
  title: string;
  instruction: string;
}

export function buildTriageScs(unresolvedScs: readonly string[]): TriageSc[] {
  return unresolvedScs.map((sc) => {
    const info = getSc(sc);
    return {
      sc,
      title: info?.title ?? sc,
      instruction: getManualTest(sc),
    };
  });
}

// Stable policy + output contract — the SYSTEM message. Separating this from the
// per-assessment task keeps the output contract constant across calls, which
// meaningfully reduces fence/append/truncation drift.
export function buildTriageSystemPrompt(): string {
  return [
    "You are an accessibility conformance auditor. You review a screenshot of a rendered web page and classify a set of WCAG success criteria.",
    "",
    "Rules:",
    "- Judge ONLY what is visible in the screenshot. Do not infer DOM, keyboard, screen-reader, or dynamic behaviour from pixels alone.",
    '- If the screenshot cannot establish a criterion\'s outcome, return "needs-review" — never guess; a wrong PASS is worse than an unresolved item.',
    "- A criterion that cannot be tested from a static screenshot (alt text, DOM semantics, keyboard operation, focus order, live regions) must be needs-review unless the violation is directly visible.",
    "",
    "Verdicts:",
    '- "pass": visible evidence supports the criterion.',
    '- "fail": visible evidence clearly contradicts the criterion.',
    '- "needs-review": the criterion cannot be determined from this image.',
    "",
    "Output contract:",
    'Return ONLY one JSON object: {"verdicts":[{"sc":"1.1.1","verdict":"pass"|"fail"|"needs-review","confidence":0.0,"reasoning":"..."}]}',
    "One object per criterion, in the given order, with exactly these keys and no others.",
    "confidence is a number 0.0–1.0; use 0.8 or above only when the evidence is clear. reasoning is one concise sentence citing visible evidence.",
    "No Markdown fences, no extra keys, no trailing text.",
  ].join("\n");
}

// Task-specific prompt — the USER message: the criteria list (as data) plus any
// engine "incomplete" context. The system prompt carries the output contract.
export function buildTriagePrompt(
  scs: readonly TriageSc[],
  incompleteContext: readonly string[],
): string {
  const scLines = scs
    .map((s) => `- ${s.sc} ${s.title}: ${s.instruction}`)
    .join("\n");

  const contextLines = incompleteContext.length
    ? `\nThe engine could not decide the following items and left them "incomplete":\n${incompleteContext
        .map((c) => `- ${c}`)
        .join("\n")}\n`
    : "";

  return [
    "Assess the following WCAG success criteria against the attached screenshot.",
    contextLines,
    "Success criteria:",
    scLines,
    "",
    "Return JSON only.",
  ]
    .filter(Boolean)
    .join("\n");
}
