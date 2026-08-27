# Additional — 9 rules (media, orientation, autocomplete, spacing, language)

Back to [engine overview](README.md).

---

## no-autoplay-audio

**WCAG 1.4.2 Audio Control — Level A · serious**

Ensures auto-playing media has a control or is muted.

- **Matcher:** `audio[autoplay], video[autoplay]`
- **Extract:** `{ muted, hasControls }`
- **Check `autoplay-control`:**
  - `muted` or `controls` present → **pass**
  - neither → **fail** — "auto-playing media has no control and is not muted"

---

## orientation

**WCAG 1.3.4 Orientation — Level AA · serious**

Ensures content is not locked to a single orientation.

- **Matcher:** `null` (document-level)
- **Extract:** scans stylesheets for an `@media … (orientation: portrait|landscape)`
  block; reports `{ locked }` (or `null` if stylesheets are unreadable)
- **Check `no-orientation-lock`:**
  - unreadable → **incomplete**
  - orientation media query found → **fail** — "content is locked to a single orientation"
  - none → **pass**

---

## autocomplete-valid

**WCAG 1.3.5 Identify Input Purpose — Level AA · serious**

Ensures `autocomplete` values are valid.

- **Matcher:** `input[autocomplete]`
- **Extract:** `{ value }` — lowercase trimmed autocomplete value
- **Check `autocomplete-valid`:**
  - `""`/`on`/`off` → **pass**
  - every token (with `section-*` prefixes normalized) is in the ~53-token allowlist
    (`name`, `email`, `tel`, `cc-number`, `bday`, …) → **pass**
  - invalid token → **fail** — "invalid autocomplete value: `<v>`"

---

## text-spacing

**WCAG 1.4.12 Text Spacing — Level AA · serious**

Ensures line/letter/word spacing is not locked with `!important`.

- **Matcher:** `null` (document-level)
- **Extract:** scans stylesheets for `line-height`/`letter-spacing`/`word-spacing`
  with `!important`; reports `{ blocked }`
- **Check `spacing-overridable`:**
  - unreadable → **incomplete**
  - a `!important` spacing rule found → **fail** — "text-spacing is locked with !important"
  - none → **pass**

---

## lang-of-parts

**WCAG 3.1.2 Language of Parts — Level AA · serious**

Ensures passages in another language are marked with `lang`.

- **Matcher:** `[lang]`
- **Extract:** `{ lang, rootLang }` — the element's `lang` vs the document `lang`
- **Check `part-lang`:**
  - always → **pass** (the presence of a `lang` attribute is what matters; this
    rule is effectively a marker that per-part language is declared)

---

## pause-stop-hide

**WCAG 2.2.2 Pause, Stop, Hide — Level A · serious**

Ensures `marquee`/`blink` are not used.

- **Matcher:** `marquee, blink`
- **Extract:** `{}` (none)
- **Check `no-marquee-blink`:**
  - always → **fail** — "marquee/blink element must not be used"

---

## media-transcript

**WCAG 1.2.1 Audio-only and Video-only (Prerecorded) — Level A · serious**

Ensures audio/video has a linked transcript.

- **Matcher:** `audio, video`
- **Extract:** `{ describedby, adjacentText }` — an `aria-describedby` reference or
  adjacent text
- **Check `transcript-present`:**
  - a described-by reference or adjacent text → **pass**
  - neither → **incomplete** — "no linked transcript detected" (absence isn't proof
    of failure — a transcript may live elsewhere)

---

## label-in-name

**WCAG 2.5.3 Label in Name — Level A · serious**

Ensures the accessible name contains the visible label text.

- **Matcher:** `button, a[href], input:not([type=hidden]), select, textarea`
- **Extract:** `{ visible, accessible }` — visible text/value vs the accessible
  name (`aria-label` or `aria-labelledby` text)
- **Check `label-in-name`:**
  - no visible or no accessible name → **pass** (nothing to compare)
  - accessible name contains the visible label (case-insensitive) → **pass**
  - otherwise → **fail** — "accessible name `<a>` does not contain visible label `<v>`"

---

## use-of-color

**WCAG 1.4.1 Use of Color — Level A · serious**

Flags instructions that reference color (to verify color isn't the only cue).

- **Matcher:** `null` (document-level)
- **Extract:** `{ hits }` — color words (red/green/blue/yellow/grey/orange/purple)
  found in the body text
- **Check `no-color-only-instructions`:**
  - no color references → **pass**
  - references found → **incomplete** — "instruction references color (…) — verify
    it is not the only cue" (never a speculative fail)
