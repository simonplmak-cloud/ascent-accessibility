export type ScNature = "machine-testable" | "ai-detectable" | "manual-only";
export type AiModality = "vision" | "audio";

export interface Instruction {
  id: string;
  sc: string;
  title: string;
  nature: ScNature;
  method?: { ruleId?: string; aiModality?: AiModality };
}

// Single-nature SCs. Machine entries map to a rule id ("planned"/"gap" mark
// follow-on work), AI entries list the modality, manual entries use manual-test.
const MACHINE: Record<string, string> = {
  "1.3.4": "orientation", "1.3.5": "autocomplete-valid", "1.4.2": "no-autoplay-audio",
  "1.4.3": "color-contrast", "1.4.4": "meta-viewport", "1.4.6": "contrast-enhanced",
  "1.4.10": "interaction:reflow", "1.4.11": "non-text-contrast", "1.4.12": "text-spacing",
  "2.1.1": "click-events-have-key-events", "2.1.2": "interaction:no-keyboard-trap",
  "2.2.1": "meta-refresh", "2.2.2": "pause-stop-hide", "2.2.3": "no-timing",
  "2.4.1": "skip-link", "2.4.2": "document-title", "2.4.3": "tabindex",
  "2.4.5": "multiple-ways", "2.4.7": "focus-visible", "2.4.8": "location", "2.4.10": "section-headings",
  "2.5.2": "pointer-cancellation", "2.5.3": "label-in-name",
  "2.5.5": "target-size-enhanced", "2.5.7": "dragging-movements", "2.5.8": "target-size",
  "3.1.1": "html-has-lang", "3.1.2": "lang-of-parts",
  "3.3.2": "label", "3.3.5": "help", "3.3.7": "redundant-entry",
  "4.1.1": "duplicate-id",
};

const AI: Record<string, AiModality> = {
  "1.2.3": "audio", "1.2.5": "audio", "1.2.6": "audio", "1.2.7": "audio",
  "1.3.2": "vision", "1.3.3": "vision", "1.3.6": "vision", "1.4.5": "vision",
  "1.4.7": "audio", "1.4.9": "vision", "1.4.13": "vision",
  "2.3.3": "vision", "2.4.9": "vision", "2.4.11": "vision", "2.4.12": "vision", "2.4.13": "vision",
  "3.1.3": "vision", "3.1.4": "vision", "3.1.5": "vision", "3.2.1": "vision", "3.2.2": "vision", "3.2.6": "vision",
  "3.3.1": "vision", "3.3.3": "vision", "4.1.3": "vision",
};

const MANUAL: string[] = [
  "1.2.8", "1.4.8", "2.1.3", "2.1.4", "2.2.4", "2.2.5", "2.2.6",
  "2.3.1", "2.3.2", "2.5.1", "2.5.4", "2.5.6", "3.1.6",
  "3.2.3", "3.2.4", "3.2.5", "3.3.4", "3.3.6", "3.3.8", "3.3.9",
];

export const NOT_APPLICABLE: string[] = ["1.2.4", "1.2.9"];

// SCs with multiple atomic instructions (each with its own nature + method).
const MIXED: Record<string, Instruction[]> = {
  "1.1.1": [
    { id: "1.1.1.1", sc: "1.1.1", title: "img/object/svg has a text alternative", nature: "machine-testable", method: { ruleId: "image-alt" } },
    { id: "1.1.1.2", sc: "1.1.1", title: "alternative text is meaningful", nature: "ai-detectable", method: { aiModality: "vision" } },
    { id: "1.1.1.3", sc: "1.1.1", title: "complex image has a longer description", nature: "manual-only" },
  ],
  "1.2.1": [
    { id: "1.2.1.1", sc: "1.2.1", title: "a transcript is associated", nature: "machine-testable", method: { ruleId: "media-transcript" } },
    { id: "1.2.1.2", sc: "1.2.1", title: "transcript conveys the same information", nature: "ai-detectable", method: { aiModality: "audio" } },
  ],
  "1.2.2": [
    { id: "1.2.2.1", sc: "1.2.2", title: "a captions track is present", nature: "machine-testable", method: { ruleId: "video-caption" } },
    { id: "1.2.2.2", sc: "1.2.2", title: "captions are accurate", nature: "ai-detectable", method: { aiModality: "audio" } },
  ],
  "1.3.1": [
    { id: "1.3.1.1", sc: "1.3.1", title: "semantic structure (lists, headings)", nature: "machine-testable", method: { ruleId: "list" } },
    { id: "1.3.1.2", sc: "1.3.1", title: "relationships announced correctly", nature: "manual-only" },
  ],
  "1.4.1": [
    { id: "1.4.1.1", sc: "1.4.1", title: "color not the only means of conveying info", nature: "machine-testable", method: { ruleId: "use-of-color" } },
    { id: "1.4.1.2", sc: "1.4.1", title: "visual confirmation of non-color cues", nature: "ai-detectable", method: { aiModality: "vision" } },
  ],
  "2.4.4": [
    { id: "2.4.4.1", sc: "2.4.4", title: "link has an accessible name", nature: "machine-testable", method: { ruleId: "link-name" } },
    { id: "2.4.4.2", sc: "2.4.4", title: "link purpose is clear in context", nature: "ai-detectable", method: { aiModality: "vision" } },
  ],
  "2.4.6": [
    { id: "2.4.6.1", sc: "2.4.6", title: "headings/labels are non-empty", nature: "machine-testable", method: { ruleId: "empty-heading" } },
    { id: "2.4.6.2", sc: "2.4.6", title: "headings/labels are descriptive", nature: "ai-detectable", method: { aiModality: "vision" } },
  ],
  "4.1.2": [
    { id: "4.1.2.1", sc: "4.1.2", title: "controls have a name, role, value", nature: "machine-testable", method: { ruleId: "button-name" } },
    { id: "4.1.2.2", sc: "4.1.2", title: "name/role/value announced correctly", nature: "manual-only" },
  ],
};

export function instructionsOf(sc: string): Instruction[] {
  if (MIXED[sc]) return MIXED[sc]!;
  if (MACHINE[sc]) {
    return [{ id: `${sc}.1`, sc, title: "machine-testable condition", nature: "machine-testable", method: { ruleId: MACHINE[sc] } }];
  }
  if (AI[sc]) {
    return [{ id: `${sc}.1`, sc, title: "AI-judgeable condition", nature: "ai-detectable", method: { aiModality: AI[sc] } }];
  }
  if (MANUAL.includes(sc)) {
    return [{ id: `${sc}.1`, sc, title: "manual condition", nature: "manual-only" }];
  }
  if (NOT_APPLICABLE.includes(sc)) {
    return [{ id: `${sc}.1`, sc, title: "not applicable (assumed absent)", nature: "manual-only" }];
  }
  return [];
}

export function naturesOf(sc: string): Set<ScNature> {
  return new Set(instructionsOf(sc).map((i) => i.nature));
}
