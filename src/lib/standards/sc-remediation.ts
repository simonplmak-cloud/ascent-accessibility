import { getManualTest } from "./sc-manual-tests";
import { localizedRemediation } from "./guidance-locales";

// Per-SC remediation guidance (how to fix). Covers the A/AA criteria in full;
// the fallback reuses the manual-test checklist as the "what to check" text so
// every SC has a browseable entry.
const REMEDIATION: Record<string, string> = {
  "1.1.1": "Add a text alternative to every image, icon, and non-text element; mark decorative images with an empty alt so assistive technology ignores them.",
  "1.2.1": "Provide a text transcript for each audio-only and video-only clip that conveys the same information.",
  "1.2.2": "Provide synchronized captions for video with spoken audio.",
  "1.2.3": "Provide an audio description or a full text alternative for video so visual information is conveyed.",
  "1.2.4": "Provide real-time captions for live video streams.",
  "1.2.5": "Provide an audio description of the important visual content in video.",
  "1.3.1": "Use semantic HTML — headings, lists, tables, labels, landmarks — so structure is exposed to assistive technology.",
  "1.3.2": "Keep the DOM order matching the visual reading order so linearized content makes sense.",
  "1.3.3": "Do not rely solely on shape, color, position, or sound for instructions; add text labels.",
  "1.3.4": "Ensure content works in both portrait and landscape orientation.",
  "1.3.5": "Identify the purpose of form fields (e.g. autocomplete) so browsers and AT can fill them correctly.",
  "1.4.1": "Do not use color as the only means of conveying information; pair color with text, icons, or underlines.",
  "1.4.2": "Do not auto-play audio for more than 3 seconds, or provide a pause/stop/mute control.",
  "1.4.3": "Ensure text has a contrast ratio of at least 4.5:1 (3:1 for large text) against its background.",
  "1.4.4": "Ensure text can be resized to 200% without loss of content or function.",
  "1.4.5": "Use text instead of images of text where the same effect is achievable.",
  "1.4.10": "Ensure content reflows to a single column at 320px width without horizontal scrolling or loss.",
  "1.4.11": "Ensure non-text UI components have a contrast ratio of at least 3:1 against adjacent colors.",
  "1.4.12": "Allow text spacing overrides (line-height, letter/word/paragraph spacing) without clipping.",
  "1.4.13": "Make hover and focus content dismissible, hoverable, and persistent.",
  "2.1.1": "Make every interactive element operable by keyboard alone.",
  "2.1.2": "Ensure keyboard focus is never trapped inside a component or modal.",
  "2.1.4": "Let users turn off, remap, or limit single-character keyboard shortcuts.",
  "2.2.1": "Let users turn off, adjust, or extend any time limit.",
  "2.2.2": "Provide a pause, stop, or hide control for content that moves, blinks, or auto-updates.",
  "2.3.1": "Ensure no content flashes more than three times per second.",
  "2.4.1": "Provide a skip link or landmarks to bypass repeated content blocks.",
  "2.4.2": "Provide a descriptive, unique <title> for each page.",
  "2.4.3": "Ensure focus follows a logical order through the page.",
  "2.4.4": "Make each link's purpose clear from its text or accessible name in context.",
  "2.4.5": "Provide more than one way to reach each page (navigation, search, or sitemap).",
  "2.4.6": "Use descriptive headings and labels.",
  "2.4.7": "Ensure the keyboard focus indicator is always visible.",
  "2.4.11": "Ensure focused elements are not obscured by sticky headers, dialogs, or overlays.",
  "2.5.1": "Provide single-pointer alternatives for multi-point or path-based gestures.",
  "2.5.2": "Trigger actions on pointer-up and allow cancellation (no down-event activation).",
  "2.5.3": "Make the visible label of each control match its accessible name.",
  "2.5.4": "Provide a button alternative for functions triggered by device motion.",
  "2.5.7": "Allow dragging actions to be performed with a single pointer without dragging.",
  "2.5.8": "Ensure interactive targets are at least 24×24 CSS pixels with adequate spacing.",
  "3.1.1": "Set a correct lang attribute on the <html> element.",
  "3.1.2": "Mark passages in a different language with their own lang attribute.",
  "3.2.1": "Ensure nothing changes unexpectedly when an element receives focus.",
  "3.2.2": "Ensure changing a control's value does not cause unexpected context changes.",
  "3.2.3": "Keep navigation and repeated components in a consistent order.",
  "3.2.4": "Identify repeated components consistently.",
  "3.2.6": "Keep help options in the same place across pages.",
  "3.3.1": "Identify input errors in text and describe them to the user.",
  "3.3.2": "Provide a visible label or instructions for every input.",
  "3.3.3": "Include a suggestion for how to fix each error.",
  "3.3.4": "Allow users to review, confirm, and correct legal/financial/data submissions before finalizing.",
  "3.3.7": "Do not require re-entering information the user has already provided.",
  "3.3.8": "Provide an alternative to cognitive authentication tests.",
  "4.1.1": "Ensure markup is valid and correctly nested (WCAG 2.0/2.1 only).",
  "4.1.2": "Give every control a correct name, role, and value via proper HTML or ARIA.",
  "4.1.3": "Announce status changes via live regions.",
};

export function getScRemediation(scNum: string, locale?: string): string {
  const localized = localizedRemediation(scNum, locale);
  if (localized) return localized;
  const thenFix =
    locale === "zh-Hant"
      ? "然後實施相應的修復並重新執行評估。"
      : locale === "zh-Hans"
        ? "然后实施相应的修复并重新运行评估。"
        : "Then implement the corresponding fix and re-run the assessment.";
  return (
    REMEDIATION[scNum] ??
    `${getManualTest(scNum, locale)} ${thenFix}`
  );
}
