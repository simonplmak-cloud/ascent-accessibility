import type { ScAiConfig } from "./sc-config";

const LANGUAGE_NAMES: Record<string, string> = {
  "zh-Hant": "Traditional Chinese (繁體中文)",
  "zh-Hans": "Simplified Chinese (简体中文)",
};

// Ask the model to write its reasoning in the assessment's locale (new scans).
function reasoningLanguageLine(locale?: string): string {
  const name = locale ? LANGUAGE_NAMES[locale] : undefined;
  return name ? `- Write the "reasoning" field in ${name}.` : "";
}

// Stable policy + output contract — the SYSTEM message. Separating this from the
// per-assessment task keeps the output contract constant across calls, which
// meaningfully reduces fence/append/truncation drift.
export function buildTriageSystemPrompt(locale?: string, pageLanguages?: string[]): string {
  const lang = reasoningLanguageLine(locale);
  const pageLangLine =
    pageLanguages && pageLanguages.length > 0
      ? `- The page content is written in: ${pageLanguages.join(", ")}.`
      : "";
  return [
    "You are an accessibility conformance auditor. You review a rendered web page and classify a set of WCAG success criteria.",
    "",
    "Tools: you may be provided browser tools (accessibility tree, element inspection, contrast, links, headings, images/alt, reading order, and focus/hover/error-state triggers). If tools are available, call them to gather evidence about the live page — do not guess.",
    "",
    pageLangLine,
    "",
    "Rules:",
    "- Base each decision on the screenshot AND the tool results together.",
    "- Prefer a tool over 'needs-review' when a tool can settle the criterion (e.g. trigger_focus/inspect_element for focus appearance, get_a11y_tree for landmarks/roles, check_contrast for contrast, get_links/get_headings/get_reading_order for structure, trigger_input_and_errors for error states).",
    '- If the evidence still cannot establish a criterion\'s outcome, return "needs-review" — never guess; a wrong PASS is worse than an unresolved item.',
    lang,
    "",
    "Verdicts:",
    '- "pass": evidence supports the criterion.',
    '- "fail": evidence clearly contradicts the criterion.',
    '- "needs-review": the criterion cannot be determined.',
    "",
    "Output contract:",
    'Return ONLY one JSON object: {"verdicts":[{"sc":"1.1.1","verdict":"pass"|"fail"|"needs-review","confidence":0.0,"reasoning":"..."}]}',
    "One object per criterion, in the given order, with exactly these keys and no others.",
    "confidence is a number 0.0–1.0; use 0.8 or above only when the evidence is clear. reasoning is one concise sentence citing the evidence.",
    "No Markdown fences, no extra keys, no trailing text.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

// Per-criterion USER prompt built from a rule's config (one call per criterion).
export function buildScPrompt(config: ScAiConfig, locale?: string): string {
  const lang = reasoningLanguageLine(locale);
  const lines: string[] = [];
  lines.push(`Assess WCAG ${config.sc} against the attached ${config.modality === "audio" ? "media" : "screenshot"}.`);
  lines.push("");
  lines.push(`What to evaluate: ${config.instruction}`);

  if (config.whatToLookFor.length > 0) {
    lines.push("");
    lines.push("Look specifically for:");
    for (const item of config.whatToLookFor) lines.push(`- ${item}`);
  }

  if (config.passRequires.length > 0 || config.failRequires.length > 0) {
    lines.push("");
    lines.push("Decision rules:");
    for (const p of config.passRequires) lines.push(`- PASS only if: ${p}`);
    for (const f of config.failRequires) lines.push(`- FAIL only if: ${f}`);
  }
  lines.push("- Otherwise return needs-review — do not guess.");

  if (config.examples?.fail) {
    lines.push("");
    lines.push(`Example of failure: ${config.examples.fail}`);
  }
  if (config.examples?.pass) {
    lines.push(`Example of passing: ${config.examples.pass}`);
  }

  if (lang) {
    lines.push("");
    lines.push(lang);
  }

  lines.push("");
  lines.push("Return JSON only.");
  return lines.filter(Boolean).join("\n");
}
