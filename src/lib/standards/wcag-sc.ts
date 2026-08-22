import { standardsFor } from "./standards-locales";

export type WcagLevel = "A" | "AA" | "AAA";
export type WcagVersion = "2.0" | "2.1" | "2.2";

export interface WcagSc {
  num: string;
  title: string;
  level: WcagLevel;
  principle: 1 | 2 | 3 | 4;
  slug: string;
  introducedIn: WcagVersion;
  removedIn?: WcagVersion;
}

// SCs added in WCAG 2.1 (17) and 2.2 (9); everything else is 2.0. 4.1.1 Parsing
// was removed in 2.2.
const SC_INTRODUCED: Record<string, WcagVersion> = {
  // 2.1 additions
  "1.3.4": "2.1", "1.3.5": "2.1", "1.3.6": "2.1",
  "1.4.10": "2.1", "1.4.11": "2.1", "1.4.12": "2.1", "1.4.13": "2.1",
  "2.1.4": "2.1", "2.2.6": "2.1", "2.3.3": "2.1",
  "2.5.1": "2.1", "2.5.2": "2.1", "2.5.3": "2.1", "2.5.4": "2.1",
  "2.5.5": "2.1", "2.5.6": "2.1", "4.1.3": "2.1",
  // 2.2 additions
  "2.4.11": "2.2", "2.4.12": "2.2", "2.4.13": "2.2",
  "2.5.7": "2.2", "2.5.8": "2.2",
  "3.2.6": "2.2", "3.3.7": "2.2", "3.3.8": "2.2", "3.3.9": "2.2",
};

const SC_REMOVED: Record<string, WcagVersion> = {
  "4.1.1": "2.2",
};

// Authoritative WCAG 2.2 success criteria (excludes the obsolete 4.1.1 Parsing).
// Sourced from https://www.w3.org/TR/WCAG22/.
const RAW_SCS: Omit<WcagSc, "introducedIn" | "removedIn">[] = [
  { num: "1.1.1", title: "Non-text Content", level: "A", principle: 1, slug: "non-text-content" },
  { num: "1.2.1", title: "Audio-only and Video-only (Prerecorded)", level: "A", principle: 1, slug: "audio-only-and-video-only-prerecorded" },
  { num: "1.2.2", title: "Captions (Prerecorded)", level: "A", principle: 1, slug: "captions-prerecorded" },
  { num: "1.2.3", title: "Audio Description or Media Alternative (Prerecorded)", level: "A", principle: 1, slug: "audio-description-or-media-alternative-prerecorded" },
  { num: "1.2.4", title: "Captions (Live)", level: "AA", principle: 1, slug: "captions-live" },
  { num: "1.2.5", title: "Audio Description (Prerecorded)", level: "AA", principle: 1, slug: "audio-description-prerecorded" },
  { num: "1.2.6", title: "Sign Language (Prerecorded)", level: "AAA", principle: 1, slug: "sign-language-prerecorded" },
  { num: "1.2.7", title: "Extended Audio Description (Prerecorded)", level: "AAA", principle: 1, slug: "extended-audio-description-prerecorded" },
  { num: "1.2.8", title: "Media Alternative (Prerecorded)", level: "AAA", principle: 1, slug: "media-alternative-prerecorded" },
  { num: "1.2.9", title: "Audio-only (Live)", level: "AAA", principle: 1, slug: "audio-only-live" },
  { num: "1.3.1", title: "Info and Relationships", level: "A", principle: 1, slug: "info-and-relationships" },
  { num: "1.3.2", title: "Meaningful Sequence", level: "A", principle: 1, slug: "meaningful-sequence" },
  { num: "1.3.3", title: "Sensory Characteristics", level: "A", principle: 1, slug: "sensory-characteristics" },
  { num: "1.3.4", title: "Orientation", level: "AA", principle: 1, slug: "orientation" },
  { num: "1.3.5", title: "Identify Input Purpose", level: "AA", principle: 1, slug: "identify-input-purpose" },
  { num: "1.3.6", title: "Identify Purpose", level: "AAA", principle: 1, slug: "identify-purpose" },
  { num: "1.4.1", title: "Use of Color", level: "A", principle: 1, slug: "use-of-color" },
  { num: "1.4.2", title: "Audio Control", level: "A", principle: 1, slug: "audio-control" },
  { num: "1.4.3", title: "Contrast (Minimum)", level: "AA", principle: 1, slug: "contrast-minimum" },
  { num: "1.4.4", title: "Resize Text", level: "AA", principle: 1, slug: "resize-text" },
  { num: "1.4.5", title: "Images of Text", level: "AA", principle: 1, slug: "images-of-text" },
  { num: "1.4.6", title: "Contrast (Enhanced)", level: "AAA", principle: 1, slug: "contrast-enhanced" },
  { num: "1.4.7", title: "Low or No Background Audio", level: "AAA", principle: 1, slug: "low-or-no-background-audio" },
  { num: "1.4.8", title: "Visual Presentation", level: "AAA", principle: 1, slug: "visual-presentation" },
  { num: "1.4.9", title: "Images of Text (No Exception)", level: "AAA", principle: 1, slug: "images-of-text-no-exception" },
  { num: "1.4.10", title: "Reflow", level: "AA", principle: 1, slug: "reflow" },
  { num: "1.4.11", title: "Non-text Contrast", level: "AA", principle: 1, slug: "non-text-contrast" },
  { num: "1.4.12", title: "Text Spacing", level: "AA", principle: 1, slug: "text-spacing" },
  { num: "1.4.13", title: "Content on Hover or Focus", level: "AA", principle: 1, slug: "content-on-hover-or-focus" },
  { num: "2.1.1", title: "Keyboard", level: "A", principle: 2, slug: "keyboard" },
  { num: "2.1.2", title: "No Keyboard Trap", level: "A", principle: 2, slug: "no-keyboard-trap" },
  { num: "2.1.3", title: "Keyboard (No Exception)", level: "AAA", principle: 2, slug: "keyboard-no-exception" },
  { num: "2.1.4", title: "Character Key Shortcuts", level: "A", principle: 2, slug: "character-key-shortcuts" },
  { num: "2.2.1", title: "Timing Adjustable", level: "A", principle: 2, slug: "timing-adjustable" },
  { num: "2.2.2", title: "Pause, Stop, Hide", level: "A", principle: 2, slug: "pause-stop-hide" },
  { num: "2.2.3", title: "No Timing", level: "AAA", principle: 2, slug: "no-timing" },
  { num: "2.2.4", title: "Interruptions", level: "AAA", principle: 2, slug: "interruptions" },
  { num: "2.2.5", title: "Re-authenticating", level: "AAA", principle: 2, slug: "re-authenticating" },
  { num: "2.2.6", title: "Timeouts", level: "AAA", principle: 2, slug: "timeouts" },
  { num: "2.3.1", title: "Three Flashes or Below Threshold", level: "A", principle: 2, slug: "three-flashes-or-below-threshold" },
  { num: "2.3.2", title: "Three Flashes", level: "AAA", principle: 2, slug: "three-flashes" },
  { num: "2.3.3", title: "Animation from Interactions", level: "AAA", principle: 2, slug: "animation-from-interactions" },
  { num: "2.4.1", title: "Bypass Blocks", level: "A", principle: 2, slug: "bypass-blocks" },
  { num: "2.4.2", title: "Page Titled", level: "A", principle: 2, slug: "page-titled" },
  { num: "2.4.3", title: "Focus Order", level: "A", principle: 2, slug: "focus-order" },
  { num: "2.4.4", title: "Link Purpose (In Context)", level: "A", principle: 2, slug: "link-purpose-in-context" },
  { num: "2.4.5", title: "Multiple Ways", level: "AA", principle: 2, slug: "multiple-ways" },
  { num: "2.4.6", title: "Headings and Labels", level: "AA", principle: 2, slug: "headings-and-labels" },
  { num: "2.4.7", title: "Focus Visible", level: "AA", principle: 2, slug: "focus-visible" },
  { num: "2.4.8", title: "Location", level: "AAA", principle: 2, slug: "location" },
  { num: "2.4.9", title: "Link Purpose (Link Only)", level: "AAA", principle: 2, slug: "link-purpose-link-only" },
  { num: "2.4.10", title: "Section Headings", level: "AAA", principle: 2, slug: "section-headings" },
  { num: "2.4.11", title: "Focus Not Obscured (Minimum)", level: "AA", principle: 2, slug: "focus-not-obscured-minimum" },
  { num: "2.4.12", title: "Focus Not Obscured (Enhanced)", level: "AAA", principle: 2, slug: "focus-not-obscured-enhanced" },
  { num: "2.4.13", title: "Focus Appearance", level: "AAA", principle: 2, slug: "focus-appearance" },
  { num: "2.5.1", title: "Pointer Gestures", level: "A", principle: 2, slug: "pointer-gestures" },
  { num: "2.5.2", title: "Pointer Cancellation", level: "A", principle: 2, slug: "pointer-cancellation" },
  { num: "2.5.3", title: "Label in Name", level: "A", principle: 2, slug: "label-in-name" },
  { num: "2.5.4", title: "Motion Actuation", level: "A", principle: 2, slug: "motion-actuation" },
  { num: "2.5.5", title: "Target Size (Enhanced)", level: "AAA", principle: 2, slug: "target-size-enhanced" },
  { num: "2.5.6", title: "Concurrent Input Mechanisms", level: "AAA", principle: 2, slug: "concurrent-input-mechanisms" },
  { num: "2.5.7", title: "Dragging Movements", level: "AA", principle: 2, slug: "dragging-movements" },
  { num: "2.5.8", title: "Target Size (Minimum)", level: "AA", principle: 2, slug: "target-size-minimum" },
  { num: "3.1.1", title: "Language of Page", level: "A", principle: 3, slug: "language-of-page" },
  { num: "3.1.2", title: "Language of Parts", level: "AA", principle: 3, slug: "language-of-parts" },
  { num: "3.1.3", title: "Unusual Words", level: "AAA", principle: 3, slug: "unusual-words" },
  { num: "3.1.4", title: "Abbreviations", level: "AAA", principle: 3, slug: "abbreviations" },
  { num: "3.1.5", title: "Reading Level", level: "AAA", principle: 3, slug: "reading-level" },
  { num: "3.1.6", title: "Pronunciation", level: "AAA", principle: 3, slug: "pronunciation" },
  { num: "3.2.1", title: "On Focus", level: "A", principle: 3, slug: "on-focus" },
  { num: "3.2.2", title: "On Input", level: "A", principle: 3, slug: "on-input" },
  { num: "3.2.3", title: "Consistent Navigation", level: "AA", principle: 3, slug: "consistent-navigation" },
  { num: "3.2.4", title: "Consistent Identification", level: "AA", principle: 3, slug: "consistent-identification" },
  { num: "3.2.5", title: "Change on Request", level: "AAA", principle: 3, slug: "change-on-request" },
  { num: "3.2.6", title: "Consistent Help", level: "A", principle: 3, slug: "consistent-help" },
  { num: "3.3.1", title: "Error Identification", level: "A", principle: 3, slug: "error-identification" },
  { num: "3.3.2", title: "Labels or Instructions", level: "A", principle: 3, slug: "labels-or-instructions" },
  { num: "3.3.3", title: "Error Suggestion", level: "AA", principle: 3, slug: "error-suggestion" },
  { num: "3.3.4", title: "Error Prevention (Legal, Financial, Data)", level: "AA", principle: 3, slug: "error-prevention-legal-financial-data" },
  { num: "3.3.5", title: "Help", level: "AAA", principle: 3, slug: "help" },
  { num: "3.3.6", title: "Error Prevention (All)", level: "AAA", principle: 3, slug: "error-prevention-all" },
  { num: "3.3.7", title: "Redundant Entry", level: "A", principle: 3, slug: "redundant-entry" },
  { num: "3.3.8", title: "Accessible Authentication (Minimum)", level: "AA", principle: 3, slug: "accessible-authentication-minimum" },
  { num: "3.3.9", title: "Accessible Authentication (Enhanced)", level: "AAA", principle: 3, slug: "accessible-authentication-enhanced" },
  { num: "4.1.2", title: "Name, Role, Value", level: "A", principle: 4, slug: "name-role-value" },
  { num: "4.1.3", title: "Status Messages", level: "AA", principle: 4, slug: "status-messages" },
];

// 4.1.1 Parsing exists in 2.0/2.1 only (removed in 2.2).
const PARSING_411: Omit<WcagSc, "introducedIn" | "removedIn"> = {
  num: "4.1.1",
  title: "Parsing",
  level: "A",
  principle: 4,
  slug: "parsing",
};

export const WCAG_SCS: WcagSc[] = [...RAW_SCS, PARSING_411].map((sc) => ({
  ...sc,
  introducedIn: SC_INTRODUCED[sc.num] ?? "2.0",
  ...(SC_REMOVED[sc.num] ? { removedIn: SC_REMOVED[sc.num] } : {}),
}));

const BY_NUM = new Map(WCAG_SCS.map((sc) => [sc.num, sc]));

export function getSc(num: string): WcagSc | undefined {
  return BY_NUM.get(num);
}

/** Localized SC title (official W3C Chinese where available), else the English title. */
export function scTitle(num: string, locale?: string): string {
  const localized = standardsFor(locale)?.sc[num];
  if (localized) return localized;
  return BY_NUM.get(num)?.title ?? num;
}

export function specUrl(sc: WcagSc): string {
  return `https://www.w3.org/TR/WCAG22/#${sc.slug}`;
}

export function understandingUrl(sc: WcagSc): string {
  return `https://www.w3.org/WAI/WCAG22/Understanding/${sc.slug}.html`;
}

// Maps a rule tag like "wcag143" to SC number "1.4.3".
export function scFromTag(tag: string): string | null {
  const match = /^wcag(\d{3,4})$/.exec(tag);
  const digits = match?.[1];
  if (!digits) return null;
  return `${digits.charAt(0)}.${digits.charAt(1)}.${digits.slice(2)}`;
}

export function scsForTags(tags: readonly string[]): string[] {
  const out = new Set<string>();
  for (const tag of tags) {
    const sc = scFromTag(tag);
    if (sc && getSc(sc)) out.add(sc);
  }
  return [...out];
}

export function principleName(principle: number, locale?: string): string {
  const localized = standardsFor(locale)?.principles[principle];
  if (localized) return localized;
  switch (principle) {
    case 1: return "Perceivable";
    case 2: return "Operable";
    case 3: return "Understandable";
    case 4: return "Robust";
    default: return "Unknown";
  }
}

export interface WcagGuideline {
  num: string;
  title: string;
}

// The 13 WCAG 2.2 guidelines, ordered by principle (the reference taxonomy used
// by the training curriculum and the /standards index).
export const WCAG_GUIDELINES: WcagGuideline[] = [
  { num: "1.1", title: "Text Alternatives" },
  { num: "1.2", title: "Time-based Media" },
  { num: "1.3", title: "Adaptable" },
  { num: "1.4", title: "Distinguishable" },
  { num: "2.1", title: "Keyboard Accessible" },
  { num: "2.2", title: "Enough Time" },
  { num: "2.3", title: "Seizures and Physical Reactions" },
  { num: "2.4", title: "Navigable" },
  { num: "2.5", title: "Input Modalities" },
  { num: "3.1", title: "Readable" },
  { num: "3.2", title: "Predictable" },
  { num: "3.3", title: "Input Assistance" },
  { num: "4.1", title: "Compatible" },
];

/** "1.4.3" -> "1.4" (the guideline number). */
export function guidelineOf(scNum: string): string {
  const parts = scNum.split(".");
  return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : scNum;
}

export function guidelineName(guideline: string, locale?: string): string {
  const localized = standardsFor(locale)?.guidelines[guideline];
  if (localized) return localized;
  return WCAG_GUIDELINES.find((g) => g.num === guideline)?.title ?? guideline;
}

export function guidelinePrinciple(guideline: string): number {
  return Number.parseInt(guideline.split(".")[0] ?? "1", 10);
}
