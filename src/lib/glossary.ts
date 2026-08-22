// Plain-language accessibility glossary. The list is the STRUCTURE (term id +
// optional link target); the term text, definition, and "why it matters" are
// translated strings resolved from the "glossary" message namespace at render
// time (so the glossary localizes with the rest of the site).

export interface GlossaryTermRef {
  id: string;
  href?: string;
}

export const GLOSSARY_TERMS: GlossaryTermRef[] = [
  { id: "accessibility" },
  { id: "wcag", href: "/standards" },
  { id: "successCriterion", href: "/standards" },
  { id: "pour" },
  { id: "levels" },
  { id: "altText" },
  { id: "screenReader" },
  { id: "assistiveTechnology" },
  { id: "keyboardAccessible" },
  { id: "focusIndicator" },
  { id: "colourContrast" },
  { id: "landmark" },
  { id: "headingStructure" },
  { id: "aria" },
  { id: "conformance" },
  { id: "automatedTest" },
  { id: "manualTest" },
  { id: "aiAssistedReview" },
  { id: "vpat", href: "/human-review" },
  { id: "wcagEm", href: "/methodology" },
  { id: "section508", href: "/regulations" },
  { id: "en301549", href: "/regulations" },
];
