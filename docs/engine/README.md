# The Ascent Accessibility engine

The assessment is powered by a **clean-room, in-house rules engine** — 55
deterministic rules, each an independent, atomic accessibility assertion. There
are no third-party accessibility engines (axe-core, IBM Equal Access, Lighthouse)
in the scan path.

The rules live in `src/lib/engine/rules/`, grouped by WCAG principle:

| File | Scope | Rules |
|---|---|---|
| [`perceivable.md`](perceivable.md) | Principle 1 · Perceivable | 14 |
| [`operable.md`](operable.md) | Principle 2 · Operable | 5 |
| [`understandable.md`](understandable.md) | Principle 3 · Understandable | 3 |
| [`robust.md`](robust.md) | Principle 4 · Robust | 9 |
| [`rendering.md`](rendering.md) | Visual/rendering (contrast, targets) | 4 |
| [`interaction.md`](interaction.md) | Interaction/behavioral (keyboard, pointer) | 3 |
| [`additional.md`](additional.md) | Extra deterministics (media, autocomplete, spacing) | 9 |
| [`gap-fill.md`](gap-fill.md) | AAA + presence-based SCs | 8 |

## Rule anatomy

Every rule has the same shape (`src/lib/engine/types.ts`):

```ts
Rule {
  id: string;                    // stable rule id (also the finding ruleId)
  description: string;           // what it asserts
  help: string;                  // short remediation hint
  impact: Impact;                // critical | serious | moderate | minor
  tags: string[];                // wcag level tag + wcag SC tag (e.g. "wcag2a", "wcag111")
  wcagSc: string[];              // the success criterion number(s) it maps to
  matcher: string | null;        // CSS selector — null = document-level
  extract: (el) => Facts;        // pure DOM fact extraction
  checks: Check[];               // one or more atomic assertions
}
```

- `matcher` selects the elements the rule inspects. `null` means the rule runs
  once against the whole document.
- `extract` pulls plain facts out of the matched element (or document) — attributes,
  computed styles, geometry, or text. Checks never touch the live DOM; they operate
  on facts only, which keeps them pure and unit-testable.
- `checks` are the assertions. Each `evaluate(facts)` returns
  `{ result: "pass" | "fail" | "incomplete", failureSummary? }`.

## How a scan runs the rules

1. The engine is injected into the page via `page.addInitScript` (CDP-level, so it
   is not blocked by the target site's CSP).
2. For each rule, `matcher` selects elements (or the document).
3. `extract` pulls facts per match.
4. Each `check.evaluate` asserts over the facts.
5. Verdicts map to the report:

| Check result | Conformance verdict | Report effect |
|---|---|---|
| `pass` | `Passed` | SC marked passed |
| `fail` | `Failed` | A finding is emitted, mapped to `wcagSc` |
| `incomplete` | `CannotTell` | Unresolved — escalated to AI/human review |

A `fail` produces a `Finding` (ruleId, description, recommendation, help, the SC
number + level, and evidence). Findings are consolidated across pages, severity-
weighted, and summarized into the conformance result.

## Verdicts can be "incomplete" by design

Deterministic rules **never guess a pass or fail** when the evidence is missing:

- Computed-style rules (contrast, focus-visible, orientation, text-spacing) return
  `incomplete` when a style can't be computed or a stylesheet is unreadable.
- Presence-based rules (multiple-ways, location, help, etc.) return `incomplete`
  when the required mechanism is absent — absence isn't proof of failure.

This is the core fail-safe: a wrong PASS is worse than an unresolved item, so
"incomplete" (`CannotTell`) is the honest default and escalates to the
AI-assisted / human-review tier.

## Index of all 55 rules

| Rule | SC | Level | Impact | Matcher |
|---|---|---|---|---|
| image-alt | 1.1.1 | A | critical | `img` |
| input-image-alt | 1.1.1 | A | serious | `input[type=image]` |
| object-alt | 1.1.1 | A | serious | `object` |
| svg-img-alt | 1.1.1 | A | serious | `svg` |
| video-caption | 1.2.2 | A | serious | `video` |
| list / listitem / dlitem / definition-list | 1.3.1 | A | moderate | `ul, ol` / `li` / `dt, dd` / `dl` |
| region | 1.3.1 | AA | moderate | doc |
| landmark-unique | 1.3.1 | AA | moderate | doc |
| heading-order | 1.3.1 | AA | moderate | doc |
| empty-heading | 2.4.6 | AA | minor | `h1..h6` |
| meta-viewport | 1.4.4 | AA | serious | `meta[name=viewport]` |
| document-title | 2.4.2 | A | serious | doc |
| link-name | 2.4.4 | A | serious | `a[href]` |
| skip-link | 2.4.1 | A | moderate | doc |
| tabindex | 2.4.3 | A | serious | `[tabindex]` |
| focus-visible | 2.4.7 | AA | moderate | doc |
| html-has-lang | 3.1.1 | A | serious | `html` |
| html-lang-valid | 3.1.1 | A | serious | `html` |
| label | 3.3.2 | A | critical | form controls |
| button-name | 4.1.2 | A | critical | `button` |
| input-button-name | 4.1.2 | A | serious | `input[type=button/submit/reset]` |
| select-name | 4.1.2 | A | serious | `select` |
| frame-title | 4.1.2 | A | serious | `iframe, frame` |
| aria-roles | 4.1.2 | A | serious | `[role]` |
| aria-valid-attr-value | 4.1.2 | A | serious | ARIA attrs |
| aria-required-attr | 4.1.2 | A | serious | `[role]` |
| aria-hidden-focus | 4.1.2 | A | serious | `[aria-hidden=true]` |
| duplicate-id | 4.1.1 | A | moderate | doc |
| color-contrast | 1.4.3 | AA | serious | text elements |
| target-size | 2.5.8 | AA | serious | interactive |
| meta-refresh | 2.2.1 | A | serious | `meta[http-equiv=refresh]` |
| non-text-contrast | 1.4.11 | AA | serious | form controls |
| click-events-have-key-events | 2.1.1 | A | serious | click handlers / roles |
| pointer-cancellation | 2.5.2 | A | serious | down-event handlers |
| dragging-movements | 2.5.7 | AA | serious | `[draggable=true]` |
| no-autoplay-audio | 1.4.2 | A | serious | `audio/video[autoplay]` |
| orientation | 1.3.4 | AA | serious | doc |
| autocomplete-valid | 1.3.5 | AA | serious | `input[autocomplete]` |
| text-spacing | 1.4.12 | AA | serious | doc |
| lang-of-parts | 3.1.2 | AA | serious | `[lang]` |
| pause-stop-hide | 2.2.2 | A | serious | `marquee, blink` |
| media-transcript | 1.2.1 | A | serious | `audio, video` |
| label-in-name | 2.5.3 | A | serious | interactive controls |
| use-of-color | 1.4.1 | A | serious | doc |
| contrast-enhanced | 1.4.6 | AAA | serious | text elements |
| target-size-enhanced | 2.5.5 | AAA | serious | interactive |
| multiple-ways | 2.4.5 | AA | moderate | doc |
| location | 2.4.8 | AAA | moderate | doc |
| section-headings | 2.4.10 | AAA | moderate | doc |
| help | 3.3.5 | AAA | moderate | doc |
| redundant-entry | 3.3.7 | AA | moderate | `form` |
| no-timing | 2.2.3 | AAA | moderate | doc |
