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

export function buildTriagePrompt(
  scs: readonly TriageSc[],
  incompleteContext: readonly string[],
): string {
  const scLines = scs
    .map((s) => `- ${s.sc} ${s.title}: ${s.instruction}`)
    .join("\n");

  const contextLines = incompleteContext.length
    ? `\nThe Ascent Access engine could not decide the following items and left them "incomplete":\n${incompleteContext
        .map((c) => `- ${c}`)
        .join("\n")}\n`
    : "";

  return [
    "You are an accessibility auditor reviewing a screenshot of a rendered web page.",
    "For each WCAG success criterion below, decide PASS, FAIL, or NEEDS_REVIEW based only on what you can see.",
    "If you cannot determine the outcome with certainty, return NEEDS_REVIEW rather than guessing — a wrong PASS is worse than an unresolved item.",
    "Return confidence from 0.0 to 1.0. Only PASS or FAIL at confidence 0.8 or above.",
    "",
    contextLines,
    "Success criteria to assess:",
    scLines,
    "",
    "Respond ONLY as JSON: {\"verdicts\":[{\"sc\":\"1.1.1\",\"verdict\":\"pass\"|\"fail\"|\"needs-review\",\"confidence\":0.0,\"reasoning\":\"...\"}]}",
  ]
    .filter(Boolean)
    .join("\n");
}
