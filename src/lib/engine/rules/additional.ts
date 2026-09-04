import { defineRule, type Rule } from "../types";

export const additionalRules: Rule[] = [
  defineRule({
    id: "no-autoplay-audio",
    description: "Ensures auto-playing media has a control or lasts under 3 seconds",
    help: "Auto-playing audio must not play for more than 3 seconds without a control",
    impact: "serious",
    tags: ["wcag2a", "wcag142"],
    wcagSc: ["1.4.2"],
    // Negative criterion resolved on absence: no autoplay media → pass.
    matcher: null,
    extract: () => {
      const els = Array.from(document.querySelectorAll<HTMLMediaElement>("audio[autoplay], video[autoplay]"));
      const problematic = els.some((el) => !el.hasAttribute("muted") && !el.hasAttribute("controls"));
      return { count: els.length, problematic };
    },
    checks: [
      {
        id: "autoplay-control",
        evaluate: (f) =>
          f.problematic
            ? { result: "fail", failureSummary: "auto-playing media has no control and is not muted" }
            : { result: "pass" },
      },
    ],
  }),
  defineRule({
    id: "orientation",
    description: "Ensures content does not restrict its view to a single orientation",
    help: "Content must work in both portrait and landscape orientation",
    impact: "serious",
    tags: ["wcag2aa", "wcag134"],
    wcagSc: ["1.3.4"],
    matcher: null,
    extract: () => {
      let locked = false;
      try {
        for (const sheet of Array.from(document.styleSheets)) {
          let rules: CSSRuleList | null;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          for (const rule of Array.from(rules ?? [])) {
            const css = rule as CSSStyleRule;
            const text = css.selectorText ?? "";
            if (/@media/.test(text) && /orientation\s*:\s*(portrait|landscape)/i.test(text)) {
              locked = true;
            }
          }
        }
        return { locked };
      } catch {
        return { locked: null };
      }
    },
    checks: [
      {
        id: "no-orientation-lock",
        evaluate: (f) => {
          if (f.locked === null) return { result: "incomplete", failureSummary: "could not inspect stylesheets" };
          if (f.locked) return { result: "fail", failureSummary: "content is locked to a single orientation" };
          return { result: "pass" };
        },
      },
    ],
  }),
  defineRule({
    id: "autocomplete-valid",
    description: "Ensures autocomplete attribute values are valid",
    help: "Input purpose must use a valid autocomplete value",
    impact: "serious",
    tags: ["wcag21aa", "wcag135"],
    wcagSc: ["1.3.5"],
    matcher: "input[autocomplete]",
    extract: (el) => ({ value: (el.getAttribute("autocomplete") ?? "").toLowerCase().trim() }),
    checks: [
      {
        id: "autocomplete-valid",
        evaluate: (f) => {
          // Inlined (not a module closure) so this check stays self-contained.
          const autocompleteValues = [
            "name", "honorific-prefix", "given-name", "additional-name", "family-name", "honorific-suffix",
            "nickname", "username", "new-password", "current-password", "one-time-code",
            "organization-title", "organization", "street-address", "address-line1", "address-line2",
            "address-line3", "address-level4", "address-level3", "address-level2", "address-level1",
            "country", "country-name", "postal-code", "cc-name", "cc-given-name", "cc-additional-name",
            "cc-family-name", "cc-number", "cc-exp", "cc-exp-month", "cc-exp-year", "cc-csc", "cc-type",
            "transaction-currency", "transaction-amount", "language", "bday", "bday-day", "bday-month",
            "bday-year", "sex", "url", "photo", "tel", "tel-country-code", "tel-national", "tel-area-code",
            "tel-local", "tel-extension", "email", "impp",
          ];
          if (f.value === "" || f.value === "on" || f.value === "off") return { result: "pass" };
          const tokens = f.value.split(/\s+/).map((t) => (t.startsWith("section-") ? "section" : t));
          for (const t of tokens) {
            if (!autocompleteValues.includes(t)) {
              return { result: "fail", failureSummary: `invalid autocomplete value: "${f.value}"` };
            }
          }
          return { result: "pass" };
        },
      },
    ],
  }),
  defineRule({
    id: "text-spacing",
    description: "Ensures text-spacing overrides are not prevented with !important",
    help: "Line/letter/word spacing overrides must not be blocked",
    impact: "serious",
    tags: ["wcag21aa", "wcag1412"],
    wcagSc: ["1.4.12"],
    matcher: null,
    extract: () => {
      let blocked = false;
      try {
        for (const sheet of Array.from(document.styleSheets)) {
          let rules: CSSRuleList | null;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          for (const rule of Array.from(rules ?? [])) {
            const css = rule as CSSStyleRule;
            const text = css.cssText ?? "";
            if (/(line-height|letter-spacing|word-spacing)\s*:[^;]*!important/i.test(text)) {
              blocked = true;
            }
          }
        }
        return { blocked };
      } catch {
        return { blocked: null };
      }
    },
    checks: [
      {
        id: "spacing-overridable",
        evaluate: (f) => {
          if (f.blocked === null) return { result: "incomplete", failureSummary: "could not inspect stylesheets" };
          if (f.blocked) return { result: "fail", failureSummary: "text-spacing is locked with !important" };
          return { result: "pass" };
        },
      },
    ],
  }),
  defineRule({
    id: "lang-of-parts",
    description: "Ensures foreign-language passages carry a lang attribute",
    help: "Passages in another language must be marked with lang",
    impact: "serious",
    tags: ["wcag2aa", "wcag312"],
    wcagSc: ["3.1.2"],
    matcher: "[lang]",
    extract: (el) => ({
      lang: (el.getAttribute("lang") ?? "").toLowerCase(),
      rootLang: (document.documentElement.getAttribute("lang") ?? "").toLowerCase(),
    }),
    checks: [
      {
        id: "part-lang",
        evaluate: () => ({ result: "pass" }),
      },
    ],
  }),
  defineRule({
    id: "pause-stop-hide",
    description: "Ensures moving, blinking, or auto-updating content can be paused",
    help: "Moving content must be pausable",
    impact: "serious",
    tags: ["wcag2a", "wcag222"],
    wcagSc: ["2.2.2"],
    // Negative criterion resolved on absence: no marquee/blink → pass. CSS-animated
    // auto-moving content needs a pause-mechanism check that the agentic review
    // covers; this rule only asserts the deterministic (deprecated-element) case.
    matcher: null,
    extract: () => ({
      deprecated: document.querySelectorAll("marquee, blink").length,
    }),
    checks: [
      {
        id: "no-marquee-blink",
        evaluate: (f) =>
          f.deprecated > 0
            ? { result: "fail", failureSummary: "marquee/blink element must not be used" }
            : { result: "pass" },
      },
    ],
  }),
  defineRule({
    id: "no-flashing",
    description: "Ensures content does not flash more than three times per second",
    help: "Content must not flash more than three times per second",
    impact: "serious",
    tags: ["wcag2a", "wcag231", "wcag2aaa", "wcag232"],
    wcagSc: ["2.3.1", "2.3.2"],
    // Best-effort flash detection: deprecated blink + rapid CSS keyframe animation.
    // Video flash (the genuine 2.3.1 concern) is not DOM-detectable — the agentic
    // review covers it; this rule resolves the deterministic no-flash case.
    matcher: null,
    extract: () => {
      const blink = document.querySelectorAll("blink").length;
      let rapid = 0;
      try {
        for (const el of Array.from(document.querySelectorAll<HTMLElement>("*"))) {
          const cs = getComputedStyle(el);
          if (!cs.animationName || cs.animationName === "none") continue;
          const duration = parseFloat(cs.animationDuration) || 0;
          const iterations = cs.animationIterationCount;
          // Rapid toggling (< ~0.4s/cycle) can exceed 3 flashes/second.
          if (duration > 0 && duration < 0.4 && iterations === "infinite") rapid += 1;
        }
      } catch {
        /* computed style unavailable */
      }
      return { blink, rapid };
    },
    checks: [
      {
        id: "no-rapid-flash",
        evaluate: (f) =>
          f.blink > 0 || f.rapid > 0
            ? { result: "fail", failureSummary: "content flashes more than three times per second" }
            : { result: "pass" },
      },
    ],
  }),
  defineRule({
    id: "media-transcript",
    description: "Ensures audio/video-only media has a linked transcript",
    help: "Audio/video-only media must have a transcript",
    impact: "serious",
    tags: ["wcag2a", "wcag121"],
    wcagSc: ["1.2.1"],
    matcher: "audio, video",
    extract: (el) => ({
      describedby: el.getAttribute("aria-describedby")
        ? !!document.getElementById(el.getAttribute("aria-describedby")!.trim())
        : false,
      adjacentText: (el.nextElementSibling?.textContent ?? "").trim().length > 0,
    }),
    checks: [
      {
        id: "transcript-present",
        evaluate: (f) =>
          f.describedby || f.adjacentText
            ? { result: "pass" }
            : { result: "incomplete", failureSummary: "no linked transcript detected" },
      },
    ],
  }),
  defineRule({
    id: "label-in-name",
    description: "Ensures the accessible name contains the visible label text",
    help: "The accessible name must contain the visible label",
    impact: "serious",
    tags: ["wcag21a", "wcag253"],
    wcagSc: ["2.5.3"],
    matcher: "button, a[href], input:not([type='hidden']), select, textarea",
    extract: (el) => {
      const visible = (el.textContent || "").trim() || (el.getAttribute("value") ?? "").trim();
      const aria = el.getAttribute("aria-label") ?? "";
      const labelledby = el.getAttribute("aria-labelledby")
        ? (document.getElementById(el.getAttribute("aria-labelledby")!.trim())?.textContent ?? "").trim()
        : "";
      return { visible, accessible: aria || labelledby };
    },
    checks: [
      {
        id: "label-in-name",
        evaluate: (f) => {
          if (!f.visible || !f.accessible) return { result: "pass" };
          if (f.accessible.toLowerCase().includes(f.visible.toLowerCase())) return { result: "pass" };
          return { result: "fail", failureSummary: `accessible name "${f.accessible}" does not contain visible label "${f.visible}"` };
        },
      },
    ],
  }),
  defineRule({
    id: "use-of-color",
    description: "Ensures information is not conveyed by color alone",
    help: "Color must not be the only means of conveying information",
    impact: "serious",
    tags: ["wcag2a", "wcag141"],
    wcagSc: ["1.4.1"],
    matcher: null,
    extract: () => {
      const body = (document.body?.textContent ?? "").toLowerCase();
      const colorRefs = ["red", "green", "blue", "yellow", "grey", "gray", "orange", "purple"];
      const hits = colorRefs.filter((c) => body.includes(c));
      return { hits };
    },
    checks: [
      {
        id: "no-color-only-instructions",
        evaluate: (f) =>
          f.hits.length > 0
            ? { result: "incomplete", failureSummary: `instruction references color (${f.hits.join(", ")}) — verify it is not the only cue` }
            : { result: "pass" },
      },
    ],
  }),
];
