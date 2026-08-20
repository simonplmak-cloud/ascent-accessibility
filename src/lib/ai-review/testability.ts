// Per-SC testability matrix: which evidence each AI-detectable vision criterion
// requires to be decidable. `judgeableFromScreenshot` is true only when a static
// screenshot suffices (no DOM/keyboard/AT inspection). This is the single source
// of truth for the `judgeable` flag — never set ad-hoc.

export interface Testability {
  screenshot: boolean;
  dom: boolean;
  keyboard: boolean;
  at: boolean;
}

const TESTABILITY: Record<string, Testability> = {
  // Vision AI-detectable SCs (from nature.ts AI map).
  "1.3.2": { screenshot: false, dom: true, keyboard: false, at: false }, // reading order needs DOM order
  "1.3.3": { screenshot: true, dom: false, keyboard: false, at: false }, // "click the red button" is visible
  "1.3.6": { screenshot: false, dom: false, keyboard: false, at: true }, // purpose is programmatic
  "1.4.5": { screenshot: true, dom: false, keyboard: false, at: false }, // text-in-image is visible
  "1.4.9": { screenshot: true, dom: false, keyboard: false, at: false },
  "1.4.13": { screenshot: false, dom: true, keyboard: true, at: false }, // needs hover/focus state
  "2.3.3": { screenshot: false, dom: false, keyboard: true, at: false }, // needs interaction
  "2.4.9": { screenshot: true, dom: false, keyboard: false, at: false }, // link text is visible
  "3.1.3": { screenshot: true, dom: false, keyboard: false, at: false },
  "3.1.4": { screenshot: true, dom: false, keyboard: false, at: false },
  "3.1.5": { screenshot: false, dom: true, keyboard: false, at: false }, // needs full-text extraction
  "3.3.1": { screenshot: false, dom: true, keyboard: false, at: false }, // needs an error state
  "3.3.3": { screenshot: false, dom: true, keyboard: false, at: false }, // needs an error state
  // MIXED SCs with an ai-detectable instruction (from nature.ts MIXED).
  "1.1.1": { screenshot: false, dom: true, keyboard: false, at: false }, // "alt is meaningful" needs the alt text
  "1.4.1": { screenshot: true, dom: false, keyboard: false, at: false }, // non-colour cues are visible
  "2.4.4": { screenshot: true, dom: false, keyboard: false, at: false }, // link purpose in context
  "2.4.6": { screenshot: true, dom: false, keyboard: false, at: false }, // descriptive headings/labels
};

export function testabilityOf(sc: string): Testability {
  return (
    TESTABILITY[sc] ?? { screenshot: false, dom: true, keyboard: true, at: true }
  );
}

// True when a static screenshot alone can decide the criterion.
export function judgeableFromScreenshot(sc: string): boolean {
  const t = testabilityOf(sc);
  return t.screenshot && !t.dom && !t.keyboard && !t.at;
}
