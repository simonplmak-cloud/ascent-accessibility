import type { Impact } from "@/lib/scoring";

const CURATED: Record<string, string> = {
  "color-contrast":
    "Increase the contrast between foreground text and its background to at least 4.5:1 (3:1 for text larger than 18pt or 14pt bold).",
  "image-alt":
    'Add a meaningful alt attribute to each <img>, or alt="" for purely decorative images.',
  "input-image-alt":
    'Give each <input type="image"> an alt attribute describing the action it performs.',
  "object-alt":
    "Give each <object> element a text alternative (fallback content, aria-label, or title).",
  "svg-img-alt":
    'Give SVG images an accessible name (role="img" plus aria-label, <title>, or aria-labelledby).',
  "link-name":
    "Give every link a discernible name from its text content, aria-label, or title.",
  "button-name":
    "Give every button an accessible name via its text content or an aria-label.",
  "label":
    "Associate each form control with a visible <label> using for/id or by nesting.",
  "heading-order":
    "Use headings in a logical order without skipping levels (h1 → h2 → h3).",
  "empty-heading": "Give every heading visible text — remove empty headings or add content.",
  "html-has-lang": 'Add a lang attribute to the <html> element (e.g. lang="en").',
  "html-lang-valid": 'Set the lang attribute to a valid language code (e.g. lang="en").',
  "lang-of-parts":
    'Add a lang attribute to passages in a different language (e.g. <span lang="es">).',
  "document-title": "Provide a unique, descriptive <title> for the page.",
  "meta-viewport":
    "Do not disable user scaling in the viewport meta tag (remove maximum-scale or user-scalable=no).",
  "meta-refresh":
    'Remove <meta http-equiv="refresh"> auto-redirects; give users control over timed changes.',
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
  "definition-list": "Keep <dl> children to <dt>/<dd> groups (or wrapping <div>s).",
  dlitem: "Place <dt> and <dd> elements inside a <dl> definition list.",
  "skip-link":
    "Provide a skip link that lets keyboard users bypass repetitive navigation.",
  "video-caption": "Provide synchronized captions for video content.",
  "media-transcript": "Provide a text transcript for audio-only or video-only content.",
  "no-autoplay-audio":
    "Do not auto-play audio for more than 3 seconds; provide a pause/stop control.",
  "pause-stop-hide":
    "Provide a pause, stop, or hide control for moving, blinking, or auto-updating content.",
  "target-size":
    "Ensure interactive targets are at least 24×24 CSS pixels in size (WCAG 2.5.8).",
  "select-name": "Give each <select> an accessible name via a <label> or aria-label.",
  "input-button-name":
    "Give each input of type button/submit/reset an accessible value attribute or aria-label.",
  "autocomplete-valid":
    'Use valid autocomplete tokens on form inputs (e.g. autocomplete="email", "tel", "name").',
  "click-events-have-key-events":
    "Make elements with click handlers keyboard-operable — use a real <button>/<a>, or add Enter/Space key handling.",
  "dragging-movements":
    "Provide a single-pointer alternative for any drag-and-drop action (e.g. buttons to move items).",
  "focus-visible":
    "Ensure a visible focus indicator is shown when keyboard users tab through interactive elements.",
  "label-in-name":
    "Make the accessible name of each control contain its visible label text (helps voice-control users).",
  "non-text-contrast":
    "Ensure UI components and graphics (borders, icons) meet the 3:1 contrast minimum against their background.",
  orientation: "Do not lock content to one orientation — support both portrait and landscape.",
  "pointer-cancellation":
    "Do not act on the pointer down-event; complete actions on up-event or provide an undo.",
  "text-spacing":
    "Ensure content stays readable when users increase text, line, and paragraph spacing (no clipping or overlap).",
  "use-of-color":
    "Do not use color alone to convey information — add text labels, icons, or patterns.",
  "no-keyboard-trap":
    "Ensure keyboard focus can always move away from every component (no focus traps).",
  reflow: "Make content reflow at a 320px viewport without horizontal scrolling.",
};

export function getRecommendation(ruleId: string, impact: Impact, help?: string): string {
  const curated = CURATED[ruleId];
  if (curated) return curated;
  if (help && help.trim()) {
    return `${help.trim().replace(/\.$/, "")}. Fix the affected elements, then re-run the assessment to confirm.`;
  }
  return `Resolve the ${impact} violation reported by rule "${ruleId}" by addressing the affected elements, then re-run the assessment to confirm the issue is cleared.`;
}
