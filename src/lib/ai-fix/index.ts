import { z } from "zod";
import { resolveSettings, type AiSettings } from "@/lib/ai-review/settings";

// A8: a single supervised AI fix suggestion. Validated shape — never trusted raw.
const SuggestionSchema = z.object({
  fix: z.string().min(1),
  confidence: z.number().min(0).max(1),
  why: z.string().min(1),
  avoid: z.string().min(1),
  verify: z.string().min(1),
});
export type FixSuggestion = z.infer<typeof SuggestionSchema>;

export interface SuggestFixFinding {
  ruleId: string;
  description: string;
  recommendation: string;
  sc?: string;
  html?: string;
  target?: string;
}

const SYSTEM = [
  "You are an accessibility remediation assistant. Given ONE WCAG finding, propose ONE concrete, minimal fix.",
  "Rules:",
  '- Output STRICT JSON only, no prose: {"fix":string,"confidence":number,"why":string,"avoid":string,"verify":string}.',
  "- fix: the exact change (code or a precise instruction). Prefer native HTML over ARIA.",
  "- confidence: a number 0..1 for how confident you are the fix addresses the finding (never 1 unless trivially certain).",
  "- why: one sentence on the user impact.",
  "- avoid: the common WRONG fix to avoid (e.g. redundant ARIA, inaccurate alt text, hiding content).",
  "- verify: one concrete step a human can take to confirm the fix actually works.",
  "- Never claim the fix guarantees WCAG conformance.",
].join("\n");

function buildPrompt(finding: SuggestFixFinding): string {
  const lines = [
    `Rule: ${finding.ruleId}`,
    finding.sc ? `WCAG: ${finding.sc}` : null,
    `Finding: ${finding.description}`,
    `Current guidance: ${finding.recommendation}`,
    finding.target ? `Element: ${finding.target}` : null,
    finding.html ? `HTML: ${finding.html.slice(0, 800)}` : null,
  ];
  return lines.filter((line): line is string => Boolean(line)).join("\n");
}

// Calls an OpenAI-compatible chat endpoint and returns a Zod-validated suggestion,
// or null on any failure (network, non-JSON, or schema mismatch). Deterministic
// (temperature 0, seed 42) so suggestions are reproducible. Never throws.
export async function suggestFix(input: {
  apiKey: string;
  baseUrl: string;
  model: string;
  finding: SuggestFixFinding;
  fetchFn?: typeof fetch;
  settings?: AiSettings;
}): Promise<FixSuggestion | null> {
  const settings = resolveSettings(input.settings);
  const fetchFn = input.fetchFn ?? fetch;
  const baseUrl = input.baseUrl.replace(/\/$/, "");
  try {
    const res = await fetchFn(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        temperature: settings.temperature,
        top_p: settings.topP,
        max_tokens: settings.maxTokens,
        seed: settings.seed,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildPrompt(input.finding) },
        ],
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(settings.timeoutMs),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content) return null;
    const validated = SuggestionSchema.safeParse(JSON.parse(content));
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}
