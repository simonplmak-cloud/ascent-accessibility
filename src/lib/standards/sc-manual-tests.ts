const MANUAL_TESTS: Record<string, string> = {
  "1.1.1": "Check that every image, icon, and non-text element has a meaningful text alternative; decorative images are hidden from assistive technology.",
  "1.2.1": "For each audio-only or video-only clip, confirm a text transcript conveys the same information.",
  "1.2.2": "For each video with spoken audio, confirm synchronized captions are present and accurate.",
  "1.2.3": "For each video, confirm an audio description or text alternative conveys the visual information.",
  "1.2.4": "For any live video stream, confirm captions are provided in real time.",
  "1.2.5": "For each video, confirm an audio description describes the important visual content.",
  "1.2.6": "For each video, confirm sign-language interpretation is provided.",
  "1.2.7": "For each video, confirm extended audio description conveys all visual detail.",
  "1.2.8": "For each video, confirm a full text alternative is provided.",
  "1.3.1": "Use a screen reader to confirm headings, lists, tables, and form relationships are announced correctly.",
  "1.3.2": "Confirm the visual reading order matches the DOM order when content is linearized.",
  "1.3.3": "Confirm no instructions rely solely on shape, colour, position, or sound.",
  "1.3.4": "Rotate the device and confirm content works in both orientations.",
  "1.3.6": "Confirm the purpose of icons, regions, and controls is programmatically identifiable.",
  "1.4.1": "Confirm colour is not the only way information is conveyed (e.g. links are underlined, not just coloured).",
  "1.4.2": "If audio plays automatically, confirm it lasts under 3 seconds or has a pause/stop/mute control.",
  "1.4.4": "Zoom text to 200% and confirm content remains readable without loss of function.",
  "1.4.5": "Confirm text is used instead of images of text wherever possible.",
  "1.4.8": "Confirm users can change foreground/background colours, line spacing, and text alignment.",
  "1.4.10": "At 320px width, confirm the page reflows with no horizontal scrolling and no loss of content.",
  "1.4.12": "Override line-height, letter, word, and paragraph spacing and confirm no content is clipped.",
  "1.4.13": "Confirm hover/focus-revealed content stays visible and can be dismissed and hovered.",
  "2.1.1": "Use the Tab key only (no mouse) and confirm every interactive element is reachable and operable.",
  "2.1.2": "Confirm keyboard focus is never trapped in any component or modal.",
  "2.1.4": "If single-character shortcuts exist, confirm they can be turned off, remapped, or only apply on focus.",
  "2.2.1": "If any time limit exists, confirm it can be turned off, adjusted, or extended.",
  "2.2.2": "If content moves, blinks, or auto-updates, confirm there is a way to pause, stop, or hide it.",
  "2.3.1": "Confirm no content flashes more than three times per second.",
  "2.4.1": "Confirm a skip link or landmarks let keyboard users bypass repeated blocks.",
  "2.4.3": "Tab through the page and confirm focus follows a logical order.",
  "2.4.4": "Confirm each link's purpose is clear from its text (or accessible name) in context.",
  "2.4.5": "Confirm there is more than one way to reach each page (e.g. navigation plus search or sitemap).",
  "2.4.6": "Confirm headings and labels clearly describe their sections and controls.",
  "2.4.7": "Tab through and confirm the keyboard focus indicator is always visible.",
  "2.4.11": "Confirm focused elements are not obscured by sticky headers, dialogs, or overlays.",
  "2.5.1": "If gestures are required, confirm equivalent single-pointer (click/tap) alternatives exist.",
  "2.5.2": "Confirm actions happen on pointer-up, not pointer-down, and can be cancelled.",
  "2.5.3": "Confirm the visible label of each control matches its accessible name (so speech input works).",
  "2.5.4": "If any function uses device motion, confirm it can also be done with a button.",
  "2.5.7": "Confirm dragging actions can be done with a single pointer without dragging.",
  "2.5.8": "Confirm interactive targets are at least 24×24 CSS pixels with adequate spacing.",
  "3.1.1": "Confirm the page has a correct lang attribute and is read in the right language.",
  "3.1.2": "Confirm any passages in a different language are marked with lang.",
  "3.2.1": "Confirm nothing changes unexpectedly when an element receives focus.",
  "3.2.2": "Confirm changing a control's value does not cause unexpected context changes.",
  "3.2.3": "Confirm repeated navigation and components appear in a consistent order.",
  "3.2.4": "Confirm repeated components are identified consistently.",
  "3.2.6": "Confirm help options (contact, FAQ, chat) appear in the same place across pages.",
  "3.3.1": "If a form error occurs, confirm it is identified in text and described to the user.",
  "3.3.2": "Confirm every input has a visible label or clear instructions.",
  "3.3.3": "Confirm error messages include a suggestion for how to fix the problem.",
  "3.3.4": "For legal/financial/data submissions, confirm users can review, confirm, and correct before submitting.",
  "3.3.7": "Confirm users are not asked to re-enter information they already provided.",
  "3.3.8": "If a cognitive test is used, confirm an alternative authentication method exists.",
  "4.1.2": "Use a screen reader to confirm every control has a correct name, role, and value.",
  "4.1.3": "Trigger status changes and confirm they are announced to screen readers via a live region.",
};

import { localizedManualTest } from "./guidance-locales";

export function getManualTest(scNum: string, locale?: string): string {
  const localized = localizedManualTest(scNum, locale);
  if (localized) return localized;
  return (
    MANUAL_TESTS[scNum] ??
    (locale === "zh-Hant"
      ? "請依據 WCAG 2.2 成功準則人工審核此準則。"
      : locale === "zh-Hans"
        ? "请依据 WCAG 2.2 成功准则人工审核此准则。"
        : "Manually review this criterion against the WCAG 2.2 success criterion.")
  );
}
