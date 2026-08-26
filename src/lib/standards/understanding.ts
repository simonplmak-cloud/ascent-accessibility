import { getSc, understandingUrl } from "./wcag-sc";
import { UNDERSTANDING_ZH_HANS, UNDERSTANDING_ZH_HANT } from "./understanding-locales";

// Our own localized "Understanding" content per success criterion: the normative
// requirement (verbatim from the W3C-authorized Chinese translation for 2.0/2.1),
// plus a concise intent / benefits / examples summary. Techniques lists are NOT
// translated — the page links out to the official W3C Understanding document.

export interface UnderstandingSc {
  normative: string;
  intent: string;
  benefits: string[];
  examples: string[];
  /** "official" = normative text from the W3C-authorized translation; "unofficial" = our translation (2.2-only SCs, or zh-Hant derived). */
  source: "official" | "unofficial";
}

export function understandingFor(sc: string, locale?: string): UnderstandingSc | undefined {
  if (locale === "zh-Hans") return UNDERSTANDING_ZH_HANS[sc];
  if (locale === "zh-Hant") return UNDERSTANDING_ZH_HANT[sc];
  return undefined;
}

/** Where the "理解 (Understanding)" link points: our page for zh, W3C for en. */
export function understandingHref(sc: string, locale?: string): string {
  if (locale === "zh-Hant" || locale === "zh-Hans") return `/understanding/${sc}`;
  const info = getSc(sc);
  return info ? understandingUrl(info) : "#";
}

export function isInternalHref(href: string): boolean {
  return href.startsWith("/");
}
