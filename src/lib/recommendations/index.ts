import type { Impact } from "@/lib/scoring";

const CURATED: Record<string, string> = {
  "color-contrast":
    "Increase the contrast between foreground text and its background to at least 4.5:1 (3:1 for text larger than 18pt or 14pt bold).",
  "image-alt":
    'Add a meaningful alt attribute to each <img>, or alt="" for purely decorative images.',
  "link-name":
    "Give every link a discernible name from its text content, aria-label, or title.",
  "button-name":
    "Give every button an accessible name via its text content or an aria-label.",
  "label":
    "Associate each form control with a visible <label> using for/id or by nesting.",
  "heading-order":
    "Use headings in a logical order without skipping levels (h1 → h2 → h3).",
  "html-has-lang": 'Add a lang attribute to the <html> element (e.g. lang="en").',
  "html-lang-valid": 'Set the lang attribute to a valid language code (e.g. lang="en").',
  "document-title": "Provide a unique, descriptive <title> for the page.",
  "meta-viewport":
    "Do not disable user scaling in the viewport meta tag (remove maximum-scale or user-scalable=no).",
  "region":
    "Wrap distinct page sections in landmark elements (main, nav, header, footer, aside).",
  "landmark-unique":
    "Make each repeated landmark unique using aria-label or aria-labelledby.",
  "duplicate-id": "Remove duplicate id attributes; each id must be unique within the page.",
  "duplicate-id-aria": "Remove duplicate id attributes referenced by ARIA.",
  "aria-roles": "Use only valid ARIA role names.",
  "aria-valid-attr-value": "Use valid values for ARIA attributes.",
  "aria-required-attr": "Provide all required ARIA attributes for the role in use.",
  "aria-hidden-focus":
    "Remove focusable content from aria-hidden containers, or make those elements unfocusable.",
  tabindex:
    "Remove positive tabindex values; rely on natural document order for keyboard focus.",
  "frame-title": "Add a descriptive title attribute to each <iframe>.",
  list: "Use semantic <ul>, <ol>, or <dl> elements for lists.",
  listitem: "Ensure <li> elements are direct children of a <ul> or <ol>.",
  "skip-link":
    "Provide a skip link that lets keyboard users bypass repetitive navigation.",
  "video-caption": "Provide synchronized captions for video content.",
  "target-size":
    "Ensure interactive targets are at least 24×24 CSS pixels in size (WCAG 2.5.8).",
  "select-name": "Give each <select> an accessible name via a <label> or aria-label.",
  "input-button-name":
    "Give each input of type button/submit/reset an accessible value attribute or aria-label.",
};

export function getRecommendation(ruleId: string, impact: Impact): string {
  const curated = CURATED[ruleId];
  if (curated) return curated;
  return `Resolve the ${impact} violation reported by rule "${ruleId}" by addressing the affected elements, then re-run the assessment to confirm the issue is cleared.`;
}
