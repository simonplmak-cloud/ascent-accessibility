# WCAG Standards — Coverage & Assessment Methods

How each WCAG success criterion is assessed: the **compute → AI → human** chain,
grouped by standard. The 9 WCAG standards are covered (2.0 / 2.1 / 2.2 × A / AA / AAA);
`Section 508` maps to WCAG 2.0 A + AA (the 2017 refresh reference — see
`wcagReference` in `src/lib/standards/catalog.ts`), so it reuses the WCAG 2.0 tables.
Links go to the W3C spec for the rule text; the methodology cites the exact engine rule, formula, AI modality, or human decision point.

## Assessment chain

1. **Compute** — the in-page engine (55 rules) and the worker interaction scan produce a machine verdict per SC: `Passed` / `Failed` / `NotPresent` / `Unresolved`.
2. **AI** — `Unresolved` SCs go to the BYOK model (vision for visual SCs, audio for media SCs); only verdicts with confidence ≥ 0.8 fold in.
3. **Human** — the residual set (`HUMAN_DECISION_SCS`) is answered by a reviewer.
4. Otherwise the SC stays **Cannot tell**.

## Contrast formula (appendix)

Used by `color-contrast` (1.4.3), `contrast-enhanced` (1.4.6), `non-text-contrast` (1.4.11):

```
linearize(c) = c/255 <= 0.03928 ? (c/255)/12.92 : ((c/255 + 0.055)/1.055)^2.4
L = 0.2126·R + 0.7152·G + 0.0722·B        (relative luminance)
contrast = (Lmax + 0.05) / (Lmin + 0.05)

1.4.3  AA  : text ≥ 4.5:1 (large text ≥ 3:1)
1.4.6  AAA : text ≥ 7:1   (large text ≥ 4.5:1)
1.4.11 AA  : non-text (UI component / graphic) ≥ 3:1
```

## WCAG 2.0 A

| SC | Level | Title | Methodology |
|---|---|---|---|
| ✓ [1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) | A | Non-text Content | **Compute** — `image-alt` ("Images must have alternate text"); `input-image-alt` ("Image buttons must have alternate text"); `object-alt` ("Object elements must have alternate text"); `svg-img-alt` ("SVG images must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the alternative text a faithful, meaningful description of each image's content/function, with a longer description where needed? |
| ✓ [1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) | A | Audio-only and Video-only (Prerecorded) | **Compute** — `media-transcript` ("Audio/video-only media must have a transcript") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.2.2](https://www.w3.org/TR/WCAG22/#captions-prerecorded) | A | Captions (Prerecorded) | **Compute** — `video-caption` ("Video elements must have captions") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.3](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) | A | Audio Description or Media Alternative (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.3.1](https://www.w3.org/TR/WCAG22/#info-and-relationships) | A | Info and Relationships | **Compute** — `list` ("<ul> and <ol> must directly contain only <li> elements"); `listitem` ("<li> elements must be contained in a <ul> or <ol>"); `dlitem` ("<dt> and <dd> must be inside a <dl>"); `definition-list` ("<dl> must contain only <dt> and <dd> groups"); `region` ("All page content should be contained by landmarks"); `landmark-unique` ("Repeated landmarks must have unique labels"); `heading-order` ("Heading levels should only increase by one") · **Human** — interaction: Does a screen reader announce the relationships/structure correctly? |
|   [1.3.2](https://www.w3.org/TR/WCAG22/#meaningful-sequence) | A | Meaningful Sequence | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [1.3.3](https://www.w3.org/TR/WCAG22/#sensory-characteristics) | A | Sensory Characteristics | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.1](https://www.w3.org/TR/WCAG22/#use-of-color) | A | Use of Color | **Compute** — `use-of-color` ("Color must not be the only means of conveying information") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.2](https://www.w3.org/TR/WCAG22/#audio-control) | A | Audio Control | **Compute** — `no-autoplay-audio` ("Auto-playing audio must not play for more than 3 seconds without a control") |
| ✓ [2.1.1](https://www.w3.org/TR/WCAG22/#keyboard) | A | Keyboard | **Compute** — `click-events-have-key-events` ("Clickable elements must also be keyboard operable") |
| ✓ [2.1.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) | A | No Keyboard Trap | **Compute (interaction)** — Tab ≤20×; fail if many focusable but only 1 distinct focus target |
| ✓ [2.2.1](https://www.w3.org/TR/WCAG22/#timing-adjustable) | A | Timing Adjustable | **Compute** — `meta-refresh` ("Timed refresh must not be used") |
| ✓ [2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide) | A | Pause, Stop, Hide | **Compute** — `pause-stop-hide` ("Moving content must be pausable") |
|   [2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) | A | Three Flashes or Below Threshold | **Human** — temporal: Does anything flash more than three times per second? |
| ✓ [2.4.1](https://www.w3.org/TR/WCAG22/#bypass-blocks) | A | Bypass Blocks | **Compute** — `skip-link` ("Page should provide a skip link to main content") |
| ✓ [2.4.2](https://www.w3.org/TR/WCAG22/#page-titled) | A | Page Titled | **Compute** — `document-title` ("Documents must have a title") |
| ✓ [2.4.3](https://www.w3.org/TR/WCAG22/#focus-order) | A | Focus Order | **Compute** — `tabindex` ("Elements should not have tabindex greater than zero") |
| ✓ [2.4.4](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) | A | Link Purpose (In Context) | **Compute** — `link-name` ("Links must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) | A | Language of Page | **Compute** — `html-has-lang` ("<html> element must have a lang attribute"); `html-lang-valid` ("<html> element must have a valid lang value") |
|   [3.2.1](https://www.w3.org/TR/WCAG22/#on-focus) | A | On Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.2](https://www.w3.org/TR/WCAG22/#on-input) | A | On Input | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.3.1](https://www.w3.org/TR/WCAG22/#error-identification) | A | Error Identification | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [3.3.2](https://www.w3.org/TR/WCAG22/#labels-or-instructions) | A | Labels or Instructions | **Compute** — `label` ("Form elements must have labels") |
| ✓ [4.1.1](https://www.w3.org/TR/WCAG21/#parsing) | A | Parsing | **Compute** — `duplicate-id` ("ID attribute values must be unique") |
| ✓ [4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value) | A | Name, Role, Value | **Compute** — `button-name` ("Buttons must have an accessible name"); `input-button-name` ("Input buttons must have an accessible name"); `select-name` ("Select elements must have an accessible name"); `frame-title` ("Frames must have a title"); `aria-roles` ("ARIA roles used must conform to valid values"); `aria-valid-attr-value` ("ARIA attributes must have valid values"); `aria-required-attr` ("ARIA roles must have all required attributes"); `aria-hidden-focus` ("ARIA-hidden elements must not contain focusable elements") · **Human** — interaction: Does a screen reader announce the name/role/value correctly? |

## WCAG 2.0 AA

| SC | Level | Title | Methodology |
|---|---|---|---|
| ✓ [1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) | A | Non-text Content | **Compute** — `image-alt` ("Images must have alternate text"); `input-image-alt` ("Image buttons must have alternate text"); `object-alt` ("Object elements must have alternate text"); `svg-img-alt` ("SVG images must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the alternative text a faithful, meaningful description of each image's content/function, with a longer description where needed? |
| ✓ [1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) | A | Audio-only and Video-only (Prerecorded) | **Compute** — `media-transcript` ("Audio/video-only media must have a transcript") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.2.2](https://www.w3.org/TR/WCAG22/#captions-prerecorded) | A | Captions (Prerecorded) | **Compute** — `video-caption` ("Video elements must have captions") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.3](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) | A | Audio Description or Media Alternative (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.4](https://www.w3.org/TR/WCAG22/#captions-live) | AA | Captions (Live) | **Not machine-checked** — feature-flag applicability; unresolved |
|   [1.2.5](https://www.w3.org/TR/WCAG22/#audio-description-prerecorded) | AA | Audio Description (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.3.1](https://www.w3.org/TR/WCAG22/#info-and-relationships) | A | Info and Relationships | **Compute** — `list` ("<ul> and <ol> must directly contain only <li> elements"); `listitem` ("<li> elements must be contained in a <ul> or <ol>"); `dlitem` ("<dt> and <dd> must be inside a <dl>"); `definition-list` ("<dl> must contain only <dt> and <dd> groups"); `region` ("All page content should be contained by landmarks"); `landmark-unique` ("Repeated landmarks must have unique labels"); `heading-order` ("Heading levels should only increase by one") · **Human** — interaction: Does a screen reader announce the relationships/structure correctly? |
|   [1.3.2](https://www.w3.org/TR/WCAG22/#meaningful-sequence) | A | Meaningful Sequence | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [1.3.3](https://www.w3.org/TR/WCAG22/#sensory-characteristics) | A | Sensory Characteristics | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.1](https://www.w3.org/TR/WCAG22/#use-of-color) | A | Use of Color | **Compute** — `use-of-color` ("Color must not be the only means of conveying information") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.2](https://www.w3.org/TR/WCAG22/#audio-control) | A | Audio Control | **Compute** — `no-autoplay-audio` ("Auto-playing audio must not play for more than 3 seconds without a control") |
| ✓ [1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) | AA | Contrast (Minimum) | **Compute** — `color-contrast` ("Text must have sufficient color contrast") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
| ✓ [1.4.4](https://www.w3.org/TR/WCAG22/#resize-text) | AA | Resize Text | **Compute** — `meta-viewport` ("Zooming and scaling must not be disabled") |
|   [1.4.5](https://www.w3.org/TR/WCAG22/#images-of-text) | AA | Images of Text | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.1.1](https://www.w3.org/TR/WCAG22/#keyboard) | A | Keyboard | **Compute** — `click-events-have-key-events` ("Clickable elements must also be keyboard operable") |
| ✓ [2.1.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) | A | No Keyboard Trap | **Compute (interaction)** — Tab ≤20×; fail if many focusable but only 1 distinct focus target |
| ✓ [2.2.1](https://www.w3.org/TR/WCAG22/#timing-adjustable) | A | Timing Adjustable | **Compute** — `meta-refresh` ("Timed refresh must not be used") |
| ✓ [2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide) | A | Pause, Stop, Hide | **Compute** — `pause-stop-hide` ("Moving content must be pausable") |
|   [2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) | A | Three Flashes or Below Threshold | **Human** — temporal: Does anything flash more than three times per second? |
| ✓ [2.4.1](https://www.w3.org/TR/WCAG22/#bypass-blocks) | A | Bypass Blocks | **Compute** — `skip-link` ("Page should provide a skip link to main content") |
| ✓ [2.4.2](https://www.w3.org/TR/WCAG22/#page-titled) | A | Page Titled | **Compute** — `document-title` ("Documents must have a title") |
| ✓ [2.4.3](https://www.w3.org/TR/WCAG22/#focus-order) | A | Focus Order | **Compute** — `tabindex` ("Elements should not have tabindex greater than zero") |
| ✓ [2.4.4](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) | A | Link Purpose (In Context) | **Compute** — `link-name` ("Links must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.5](https://www.w3.org/TR/WCAG22/#multiple-ways) | AA | Multiple Ways | **Compute** — `multiple-ways` ("Pages must be reachable in more than one way") |
| ✓ [2.4.6](https://www.w3.org/TR/WCAG22/#headings-and-labels) | AA | Headings and Labels | **Compute** — `empty-heading` ("Headings must not be empty") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.7](https://www.w3.org/TR/WCAG22/#focus-visible) | AA | Focus Visible | **Compute** — `focus-visible` ("Keyboard focus must be visibly indicated") |
| ✓ [3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) | A | Language of Page | **Compute** — `html-has-lang` ("<html> element must have a lang attribute"); `html-lang-valid` ("<html> element must have a valid lang value") |
| ✓ [3.1.2](https://www.w3.org/TR/WCAG22/#language-of-parts) | AA | Language of Parts | **Compute** — `lang-of-parts` ("Passages in another language must be marked with lang") |
|   [3.2.1](https://www.w3.org/TR/WCAG22/#on-focus) | A | On Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.2](https://www.w3.org/TR/WCAG22/#on-input) | A | On Input | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.3](https://www.w3.org/TR/WCAG22/#consistent-navigation) | AA | Consistent Navigation | **Human** — multipage: Is the navigation order/position consistent across pages? |
|   [3.2.4](https://www.w3.org/TR/WCAG22/#consistent-identification) | AA | Consistent Identification | **Human** — multipage: Are components with the same function identified consistently across pages? |
|   [3.3.1](https://www.w3.org/TR/WCAG22/#error-identification) | A | Error Identification | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [3.3.2](https://www.w3.org/TR/WCAG22/#labels-or-instructions) | A | Labels or Instructions | **Compute** — `label` ("Form elements must have labels") |
|   [3.3.3](https://www.w3.org/TR/WCAG22/#error-suggestion) | AA | Error Suggestion | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.3.4](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) | AA | Error Prevention (Legal, Financial, Data) | **Human** — domain: Does this flow involve a legal/financial/data commitment requiring reversible, checked, confirmed submission? |
| ✓ [4.1.1](https://www.w3.org/TR/WCAG21/#parsing) | A | Parsing | **Compute** — `duplicate-id` ("ID attribute values must be unique") |
| ✓ [4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value) | A | Name, Role, Value | **Compute** — `button-name` ("Buttons must have an accessible name"); `input-button-name` ("Input buttons must have an accessible name"); `select-name` ("Select elements must have an accessible name"); `frame-title` ("Frames must have a title"); `aria-roles` ("ARIA roles used must conform to valid values"); `aria-valid-attr-value` ("ARIA attributes must have valid values"); `aria-required-attr` ("ARIA roles must have all required attributes"); `aria-hidden-focus` ("ARIA-hidden elements must not contain focusable elements") · **Human** — interaction: Does a screen reader announce the name/role/value correctly? |

## WCAG 2.0 AAA

| SC | Level | Title | Methodology |
|---|---|---|---|
| ✓ [1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) | A | Non-text Content | **Compute** — `image-alt` ("Images must have alternate text"); `input-image-alt` ("Image buttons must have alternate text"); `object-alt` ("Object elements must have alternate text"); `svg-img-alt` ("SVG images must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the alternative text a faithful, meaningful description of each image's content/function, with a longer description where needed? |
| ✓ [1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) | A | Audio-only and Video-only (Prerecorded) | **Compute** — `media-transcript` ("Audio/video-only media must have a transcript") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.2.2](https://www.w3.org/TR/WCAG22/#captions-prerecorded) | A | Captions (Prerecorded) | **Compute** — `video-caption` ("Video elements must have captions") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.3](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) | A | Audio Description or Media Alternative (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.4](https://www.w3.org/TR/WCAG22/#captions-live) | AA | Captions (Live) | **Not machine-checked** — feature-flag applicability; unresolved |
|   [1.2.5](https://www.w3.org/TR/WCAG22/#audio-description-prerecorded) | AA | Audio Description (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.6](https://www.w3.org/TR/WCAG22/#sign-language-prerecorded) | AAA | Sign Language (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.7](https://www.w3.org/TR/WCAG22/#extended-audio-description-prerecorded) | AAA | Extended Audio Description (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.8](https://www.w3.org/TR/WCAG22/#media-alternative-prerecorded) | AAA | Media Alternative (Prerecorded) | **Human** — editorial: Does the text alternative present equivalent information to the prerecorded media? |
|   [1.2.9](https://www.w3.org/TR/WCAG22/#audio-only-live) | AAA | Audio-only (Live) | **Not machine-checked** — feature-flag applicability; unresolved |
| ✓ [1.3.1](https://www.w3.org/TR/WCAG22/#info-and-relationships) | A | Info and Relationships | **Compute** — `list` ("<ul> and <ol> must directly contain only <li> elements"); `listitem` ("<li> elements must be contained in a <ul> or <ol>"); `dlitem` ("<dt> and <dd> must be inside a <dl>"); `definition-list` ("<dl> must contain only <dt> and <dd> groups"); `region` ("All page content should be contained by landmarks"); `landmark-unique` ("Repeated landmarks must have unique labels"); `heading-order` ("Heading levels should only increase by one") · **Human** — interaction: Does a screen reader announce the relationships/structure correctly? |
|   [1.3.2](https://www.w3.org/TR/WCAG22/#meaningful-sequence) | A | Meaningful Sequence | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [1.3.3](https://www.w3.org/TR/WCAG22/#sensory-characteristics) | A | Sensory Characteristics | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.1](https://www.w3.org/TR/WCAG22/#use-of-color) | A | Use of Color | **Compute** — `use-of-color` ("Color must not be the only means of conveying information") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.2](https://www.w3.org/TR/WCAG22/#audio-control) | A | Audio Control | **Compute** — `no-autoplay-audio` ("Auto-playing audio must not play for more than 3 seconds without a control") |
| ✓ [1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) | AA | Contrast (Minimum) | **Compute** — `color-contrast` ("Text must have sufficient color contrast") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
| ✓ [1.4.4](https://www.w3.org/TR/WCAG22/#resize-text) | AA | Resize Text | **Compute** — `meta-viewport` ("Zooming and scaling must not be disabled") |
|   [1.4.5](https://www.w3.org/TR/WCAG22/#images-of-text) | AA | Images of Text | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.6](https://www.w3.org/TR/WCAG22/#contrast-enhanced) | AAA | Contrast (Enhanced) | **Compute** — `contrast-enhanced` ("Text must have enhanced color contrast (7:1, 4.5:1 large)") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
|   [1.4.7](https://www.w3.org/TR/WCAG22/#low-or-no-background-audio) | AAA | Low or No Background Audio | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.4.8](https://www.w3.org/TR/WCAG22/#visual-presentation) | AAA | Visual Presentation | **Human** — editorial: Do the visual-presentation controls meet the required thresholds? |
|   [1.4.9](https://www.w3.org/TR/WCAG22/#images-of-text-no-exception) | AAA | Images of Text (No Exception) | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.1.1](https://www.w3.org/TR/WCAG22/#keyboard) | A | Keyboard | **Compute** — `click-events-have-key-events` ("Clickable elements must also be keyboard operable") |
| ✓ [2.1.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) | A | No Keyboard Trap | **Compute (interaction)** — Tab ≤20×; fail if many focusable but only 1 distinct focus target |
|   [2.1.3](https://www.w3.org/TR/WCAG22/#keyboard-no-exception) | AAA | Keyboard (No Exception) | **Human** — interaction: Can the entire content be operated from the keyboard alone, with no exception? |
| ✓ [2.2.1](https://www.w3.org/TR/WCAG22/#timing-adjustable) | A | Timing Adjustable | **Compute** — `meta-refresh` ("Timed refresh must not be used") |
| ✓ [2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide) | A | Pause, Stop, Hide | **Compute** — `pause-stop-hide` ("Moving content must be pausable") |
| ✓ [2.2.3](https://www.w3.org/TR/WCAG22/#no-timing) | AAA | No Timing | **Compute** — `no-timing` ("Timing must not be essential to the content") |
|   [2.2.4](https://www.w3.org/TR/WCAG22/#interruptions) | AAA | Interruptions | **Human** — temporal: Can interruptions be postponed or suppressed by the user? |
|   [2.2.5](https://www.w3.org/TR/WCAG22/#re-authenticating) | AAA | Re-authenticating | **Human** — temporal: Is entered data preserved when re-authenticating after a session expiry? |
|   [2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) | A | Three Flashes or Below Threshold | **Human** — temporal: Does anything flash more than three times per second? |
|   [2.3.2](https://www.w3.org/TR/WCAG22/#three-flashes) | AAA | Three Flashes | **Human** — temporal: Does anything flash more than three times per second? |
| ✓ [2.4.1](https://www.w3.org/TR/WCAG22/#bypass-blocks) | A | Bypass Blocks | **Compute** — `skip-link` ("Page should provide a skip link to main content") |
| ✓ [2.4.2](https://www.w3.org/TR/WCAG22/#page-titled) | A | Page Titled | **Compute** — `document-title` ("Documents must have a title") |
| ✓ [2.4.3](https://www.w3.org/TR/WCAG22/#focus-order) | A | Focus Order | **Compute** — `tabindex` ("Elements should not have tabindex greater than zero") |
| ✓ [2.4.4](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) | A | Link Purpose (In Context) | **Compute** — `link-name` ("Links must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.5](https://www.w3.org/TR/WCAG22/#multiple-ways) | AA | Multiple Ways | **Compute** — `multiple-ways` ("Pages must be reachable in more than one way") |
| ✓ [2.4.6](https://www.w3.org/TR/WCAG22/#headings-and-labels) | AA | Headings and Labels | **Compute** — `empty-heading` ("Headings must not be empty") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.7](https://www.w3.org/TR/WCAG22/#focus-visible) | AA | Focus Visible | **Compute** — `focus-visible` ("Keyboard focus must be visibly indicated") |
| ✓ [2.4.8](https://www.w3.org/TR/WCAG22/#location) | AAA | Location | **Compute** — `location` ("The user's location in the site must be identifiable") |
|   [2.4.9](https://www.w3.org/TR/WCAG22/#link-purpose-link-only) | AAA | Link Purpose (Link Only) | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.10](https://www.w3.org/TR/WCAG22/#section-headings) | AAA | Section Headings | **Compute** — `section-headings` ("Sections of content must have headings") |
| ✓ [3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) | A | Language of Page | **Compute** — `html-has-lang` ("<html> element must have a lang attribute"); `html-lang-valid` ("<html> element must have a valid lang value") |
| ✓ [3.1.2](https://www.w3.org/TR/WCAG22/#language-of-parts) | AA | Language of Parts | **Compute** — `lang-of-parts` ("Passages in another language must be marked with lang") |
|   [3.1.3](https://www.w3.org/TR/WCAG22/#unusual-words) | AAA | Unusual Words | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.1.4](https://www.w3.org/TR/WCAG22/#abbreviations) | AAA | Abbreviations | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.1.5](https://www.w3.org/TR/WCAG22/#reading-level) | AAA | Reading Level | **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the prose at an appropriate reading level for the audience (or is a plain-language version provided)? |
|   [3.1.6](https://www.w3.org/TR/WCAG22/#pronunciation) | AAA | Pronunciation | **Human** — editorial: Where pronunciation affects meaning, is a mechanism provided? |
|   [3.2.1](https://www.w3.org/TR/WCAG22/#on-focus) | A | On Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.2](https://www.w3.org/TR/WCAG22/#on-input) | A | On Input | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.3](https://www.w3.org/TR/WCAG22/#consistent-navigation) | AA | Consistent Navigation | **Human** — multipage: Is the navigation order/position consistent across pages? |
|   [3.2.4](https://www.w3.org/TR/WCAG22/#consistent-identification) | AA | Consistent Identification | **Human** — multipage: Are components with the same function identified consistently across pages? |
|   [3.2.5](https://www.w3.org/TR/WCAG22/#change-on-request) | AAA | Change on Request | **Human** — interaction: Is a change of context initiated only on user request, or can it be turned off? |
|   [3.3.1](https://www.w3.org/TR/WCAG22/#error-identification) | A | Error Identification | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [3.3.2](https://www.w3.org/TR/WCAG22/#labels-or-instructions) | A | Labels or Instructions | **Compute** — `label` ("Form elements must have labels") |
|   [3.3.3](https://www.w3.org/TR/WCAG22/#error-suggestion) | AA | Error Suggestion | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.3.4](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) | AA | Error Prevention (Legal, Financial, Data) | **Human** — domain: Does this flow involve a legal/financial/data commitment requiring reversible, checked, confirmed submission? |
| ✓ [3.3.5](https://www.w3.org/TR/WCAG22/#help) | AAA | Help | **Compute** — `help` ("Context-sensitive help must be available") |
|   [3.3.6](https://www.w3.org/TR/WCAG22/#error-prevention-all) | AAA | Error Prevention (All) | **Human** — domain: Does this flow involve a legal/financial/data commitment requiring reversible, checked, confirmed submission? |
| ✓ [4.1.1](https://www.w3.org/TR/WCAG21/#parsing) | A | Parsing | **Compute** — `duplicate-id` ("ID attribute values must be unique") |
| ✓ [4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value) | A | Name, Role, Value | **Compute** — `button-name` ("Buttons must have an accessible name"); `input-button-name` ("Input buttons must have an accessible name"); `select-name` ("Select elements must have an accessible name"); `frame-title` ("Frames must have a title"); `aria-roles` ("ARIA roles used must conform to valid values"); `aria-valid-attr-value` ("ARIA attributes must have valid values"); `aria-required-attr` ("ARIA roles must have all required attributes"); `aria-hidden-focus` ("ARIA-hidden elements must not contain focusable elements") · **Human** — interaction: Does a screen reader announce the name/role/value correctly? |

## WCAG 2.1 A

| SC | Level | Title | Methodology |
|---|---|---|---|
| ✓ [1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) | A | Non-text Content | **Compute** — `image-alt` ("Images must have alternate text"); `input-image-alt` ("Image buttons must have alternate text"); `object-alt` ("Object elements must have alternate text"); `svg-img-alt` ("SVG images must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the alternative text a faithful, meaningful description of each image's content/function, with a longer description where needed? |
| ✓ [1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) | A | Audio-only and Video-only (Prerecorded) | **Compute** — `media-transcript` ("Audio/video-only media must have a transcript") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.2.2](https://www.w3.org/TR/WCAG22/#captions-prerecorded) | A | Captions (Prerecorded) | **Compute** — `video-caption` ("Video elements must have captions") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.3](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) | A | Audio Description or Media Alternative (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.3.1](https://www.w3.org/TR/WCAG22/#info-and-relationships) | A | Info and Relationships | **Compute** — `list` ("<ul> and <ol> must directly contain only <li> elements"); `listitem` ("<li> elements must be contained in a <ul> or <ol>"); `dlitem` ("<dt> and <dd> must be inside a <dl>"); `definition-list` ("<dl> must contain only <dt> and <dd> groups"); `region` ("All page content should be contained by landmarks"); `landmark-unique` ("Repeated landmarks must have unique labels"); `heading-order` ("Heading levels should only increase by one") · **Human** — interaction: Does a screen reader announce the relationships/structure correctly? |
|   [1.3.2](https://www.w3.org/TR/WCAG22/#meaningful-sequence) | A | Meaningful Sequence | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [1.3.3](https://www.w3.org/TR/WCAG22/#sensory-characteristics) | A | Sensory Characteristics | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.1](https://www.w3.org/TR/WCAG22/#use-of-color) | A | Use of Color | **Compute** — `use-of-color` ("Color must not be the only means of conveying information") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.2](https://www.w3.org/TR/WCAG22/#audio-control) | A | Audio Control | **Compute** — `no-autoplay-audio` ("Auto-playing audio must not play for more than 3 seconds without a control") |
| ✓ [2.1.1](https://www.w3.org/TR/WCAG22/#keyboard) | A | Keyboard | **Compute** — `click-events-have-key-events` ("Clickable elements must also be keyboard operable") |
| ✓ [2.1.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) | A | No Keyboard Trap | **Compute (interaction)** — Tab ≤20×; fail if many focusable but only 1 distinct focus target |
|   [2.1.4](https://www.w3.org/TR/WCAG22/#character-key-shortcuts) | A | Character Key Shortcuts | **Human** — interaction: Do single-character shortcuts meet the turn-off/remap/active-only rule? |
| ✓ [2.2.1](https://www.w3.org/TR/WCAG22/#timing-adjustable) | A | Timing Adjustable | **Compute** — `meta-refresh` ("Timed refresh must not be used") |
| ✓ [2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide) | A | Pause, Stop, Hide | **Compute** — `pause-stop-hide` ("Moving content must be pausable") |
|   [2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) | A | Three Flashes or Below Threshold | **Human** — temporal: Does anything flash more than three times per second? |
| ✓ [2.4.1](https://www.w3.org/TR/WCAG22/#bypass-blocks) | A | Bypass Blocks | **Compute** — `skip-link` ("Page should provide a skip link to main content") |
| ✓ [2.4.2](https://www.w3.org/TR/WCAG22/#page-titled) | A | Page Titled | **Compute** — `document-title` ("Documents must have a title") |
| ✓ [2.4.3](https://www.w3.org/TR/WCAG22/#focus-order) | A | Focus Order | **Compute** — `tabindex` ("Elements should not have tabindex greater than zero") |
| ✓ [2.4.4](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) | A | Link Purpose (In Context) | **Compute** — `link-name` ("Links must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [2.5.1](https://www.w3.org/TR/WCAG22/#pointer-gestures) | A | Pointer Gestures | **Human** — interaction: Is a single-pointer alternative available for every path-based gesture? |
| ✓ [2.5.2](https://www.w3.org/TR/WCAG22/#pointer-cancellation) | A | Pointer Cancellation | **Compute** — `pointer-cancellation` ("Functions must be activated on pointer-up or be cancellable") |
| ✓ [2.5.3](https://www.w3.org/TR/WCAG22/#label-in-name) | A | Label in Name | **Compute** — `label-in-name` ("The accessible name must contain the visible label") |
|   [2.5.4](https://www.w3.org/TR/WCAG22/#motion-actuation) | A | Motion Actuation | **Human** — interaction: Is motion actuation non-essential, or is an alternative provided / can it be disabled? |
| ✓ [3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) | A | Language of Page | **Compute** — `html-has-lang` ("<html> element must have a lang attribute"); `html-lang-valid` ("<html> element must have a valid lang value") |
|   [3.2.1](https://www.w3.org/TR/WCAG22/#on-focus) | A | On Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.2](https://www.w3.org/TR/WCAG22/#on-input) | A | On Input | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.3.1](https://www.w3.org/TR/WCAG22/#error-identification) | A | Error Identification | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [3.3.2](https://www.w3.org/TR/WCAG22/#labels-or-instructions) | A | Labels or Instructions | **Compute** — `label` ("Form elements must have labels") |
| ✓ [4.1.1](https://www.w3.org/TR/WCAG21/#parsing) | A | Parsing | **Compute** — `duplicate-id` ("ID attribute values must be unique") |
| ✓ [4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value) | A | Name, Role, Value | **Compute** — `button-name` ("Buttons must have an accessible name"); `input-button-name` ("Input buttons must have an accessible name"); `select-name` ("Select elements must have an accessible name"); `frame-title` ("Frames must have a title"); `aria-roles` ("ARIA roles used must conform to valid values"); `aria-valid-attr-value` ("ARIA attributes must have valid values"); `aria-required-attr` ("ARIA roles must have all required attributes"); `aria-hidden-focus` ("ARIA-hidden elements must not contain focusable elements") · **Human** — interaction: Does a screen reader announce the name/role/value correctly? |

## WCAG 2.1 AA

| SC | Level | Title | Methodology |
|---|---|---|---|
| ✓ [1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) | A | Non-text Content | **Compute** — `image-alt` ("Images must have alternate text"); `input-image-alt` ("Image buttons must have alternate text"); `object-alt` ("Object elements must have alternate text"); `svg-img-alt` ("SVG images must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the alternative text a faithful, meaningful description of each image's content/function, with a longer description where needed? |
| ✓ [1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) | A | Audio-only and Video-only (Prerecorded) | **Compute** — `media-transcript` ("Audio/video-only media must have a transcript") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.2.2](https://www.w3.org/TR/WCAG22/#captions-prerecorded) | A | Captions (Prerecorded) | **Compute** — `video-caption` ("Video elements must have captions") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.3](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) | A | Audio Description or Media Alternative (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.4](https://www.w3.org/TR/WCAG22/#captions-live) | AA | Captions (Live) | **Not machine-checked** — feature-flag applicability; unresolved |
|   [1.2.5](https://www.w3.org/TR/WCAG22/#audio-description-prerecorded) | AA | Audio Description (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.3.1](https://www.w3.org/TR/WCAG22/#info-and-relationships) | A | Info and Relationships | **Compute** — `list` ("<ul> and <ol> must directly contain only <li> elements"); `listitem` ("<li> elements must be contained in a <ul> or <ol>"); `dlitem` ("<dt> and <dd> must be inside a <dl>"); `definition-list` ("<dl> must contain only <dt> and <dd> groups"); `region` ("All page content should be contained by landmarks"); `landmark-unique` ("Repeated landmarks must have unique labels"); `heading-order` ("Heading levels should only increase by one") · **Human** — interaction: Does a screen reader announce the relationships/structure correctly? |
|   [1.3.2](https://www.w3.org/TR/WCAG22/#meaningful-sequence) | A | Meaningful Sequence | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [1.3.3](https://www.w3.org/TR/WCAG22/#sensory-characteristics) | A | Sensory Characteristics | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.3.4](https://www.w3.org/TR/WCAG22/#orientation) | AA | Orientation | **Compute** — `orientation` ("Content must work in both portrait and landscape orientation") |
| ✓ [1.3.5](https://www.w3.org/TR/WCAG22/#identify-input-purpose) | AA | Identify Input Purpose | **Compute** — `autocomplete-valid` ("Input purpose must use a valid autocomplete value") |
| ✓ [1.4.1](https://www.w3.org/TR/WCAG22/#use-of-color) | A | Use of Color | **Compute** — `use-of-color` ("Color must not be the only means of conveying information") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.2](https://www.w3.org/TR/WCAG22/#audio-control) | A | Audio Control | **Compute** — `no-autoplay-audio` ("Auto-playing audio must not play for more than 3 seconds without a control") |
| ✓ [1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) | AA | Contrast (Minimum) | **Compute** — `color-contrast` ("Text must have sufficient color contrast") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
| ✓ [1.4.4](https://www.w3.org/TR/WCAG22/#resize-text) | AA | Resize Text | **Compute** — `meta-viewport` ("Zooming and scaling must not be disabled") |
|   [1.4.5](https://www.w3.org/TR/WCAG22/#images-of-text) | AA | Images of Text | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.10](https://www.w3.org/TR/WCAG22/#reflow) | AA | Reflow | **Compute (interaction)** — viewport 320px; fail if `scrollWidth > innerWidth + 1` |
| ✓ [1.4.11](https://www.w3.org/TR/WCAG22/#non-text-contrast) | AA | Non-text Contrast | **Compute** — `non-text-contrast` ("UI component borders and indicators must have 3:1 contrast") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
| ✓ [1.4.12](https://www.w3.org/TR/WCAG22/#text-spacing) | AA | Text Spacing | **Compute** — `text-spacing` ("Line/letter/word spacing overrides must not be blocked") |
|   [1.4.13](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus) | AA | Content on Hover or Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.1.1](https://www.w3.org/TR/WCAG22/#keyboard) | A | Keyboard | **Compute** — `click-events-have-key-events` ("Clickable elements must also be keyboard operable") |
| ✓ [2.1.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) | A | No Keyboard Trap | **Compute (interaction)** — Tab ≤20×; fail if many focusable but only 1 distinct focus target |
|   [2.1.4](https://www.w3.org/TR/WCAG22/#character-key-shortcuts) | A | Character Key Shortcuts | **Human** — interaction: Do single-character shortcuts meet the turn-off/remap/active-only rule? |
| ✓ [2.2.1](https://www.w3.org/TR/WCAG22/#timing-adjustable) | A | Timing Adjustable | **Compute** — `meta-refresh` ("Timed refresh must not be used") |
| ✓ [2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide) | A | Pause, Stop, Hide | **Compute** — `pause-stop-hide` ("Moving content must be pausable") |
|   [2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) | A | Three Flashes or Below Threshold | **Human** — temporal: Does anything flash more than three times per second? |
| ✓ [2.4.1](https://www.w3.org/TR/WCAG22/#bypass-blocks) | A | Bypass Blocks | **Compute** — `skip-link` ("Page should provide a skip link to main content") |
| ✓ [2.4.2](https://www.w3.org/TR/WCAG22/#page-titled) | A | Page Titled | **Compute** — `document-title` ("Documents must have a title") |
| ✓ [2.4.3](https://www.w3.org/TR/WCAG22/#focus-order) | A | Focus Order | **Compute** — `tabindex` ("Elements should not have tabindex greater than zero") |
| ✓ [2.4.4](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) | A | Link Purpose (In Context) | **Compute** — `link-name` ("Links must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.5](https://www.w3.org/TR/WCAG22/#multiple-ways) | AA | Multiple Ways | **Compute** — `multiple-ways` ("Pages must be reachable in more than one way") |
| ✓ [2.4.6](https://www.w3.org/TR/WCAG22/#headings-and-labels) | AA | Headings and Labels | **Compute** — `empty-heading` ("Headings must not be empty") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.7](https://www.w3.org/TR/WCAG22/#focus-visible) | AA | Focus Visible | **Compute** — `focus-visible` ("Keyboard focus must be visibly indicated") |
|   [2.5.1](https://www.w3.org/TR/WCAG22/#pointer-gestures) | A | Pointer Gestures | **Human** — interaction: Is a single-pointer alternative available for every path-based gesture? |
| ✓ [2.5.2](https://www.w3.org/TR/WCAG22/#pointer-cancellation) | A | Pointer Cancellation | **Compute** — `pointer-cancellation` ("Functions must be activated on pointer-up or be cancellable") |
| ✓ [2.5.3](https://www.w3.org/TR/WCAG22/#label-in-name) | A | Label in Name | **Compute** — `label-in-name` ("The accessible name must contain the visible label") |
|   [2.5.4](https://www.w3.org/TR/WCAG22/#motion-actuation) | A | Motion Actuation | **Human** — interaction: Is motion actuation non-essential, or is an alternative provided / can it be disabled? |
| ✓ [3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) | A | Language of Page | **Compute** — `html-has-lang` ("<html> element must have a lang attribute"); `html-lang-valid` ("<html> element must have a valid lang value") |
| ✓ [3.1.2](https://www.w3.org/TR/WCAG22/#language-of-parts) | AA | Language of Parts | **Compute** — `lang-of-parts` ("Passages in another language must be marked with lang") |
|   [3.2.1](https://www.w3.org/TR/WCAG22/#on-focus) | A | On Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.2](https://www.w3.org/TR/WCAG22/#on-input) | A | On Input | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.3](https://www.w3.org/TR/WCAG22/#consistent-navigation) | AA | Consistent Navigation | **Human** — multipage: Is the navigation order/position consistent across pages? |
|   [3.2.4](https://www.w3.org/TR/WCAG22/#consistent-identification) | AA | Consistent Identification | **Human** — multipage: Are components with the same function identified consistently across pages? |
|   [3.3.1](https://www.w3.org/TR/WCAG22/#error-identification) | A | Error Identification | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [3.3.2](https://www.w3.org/TR/WCAG22/#labels-or-instructions) | A | Labels or Instructions | **Compute** — `label` ("Form elements must have labels") |
|   [3.3.3](https://www.w3.org/TR/WCAG22/#error-suggestion) | AA | Error Suggestion | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.3.4](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) | AA | Error Prevention (Legal, Financial, Data) | **Human** — domain: Does this flow involve a legal/financial/data commitment requiring reversible, checked, confirmed submission? |
| ✓ [4.1.1](https://www.w3.org/TR/WCAG21/#parsing) | A | Parsing | **Compute** — `duplicate-id` ("ID attribute values must be unique") |
| ✓ [4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value) | A | Name, Role, Value | **Compute** — `button-name` ("Buttons must have an accessible name"); `input-button-name` ("Input buttons must have an accessible name"); `select-name` ("Select elements must have an accessible name"); `frame-title` ("Frames must have a title"); `aria-roles` ("ARIA roles used must conform to valid values"); `aria-valid-attr-value` ("ARIA attributes must have valid values"); `aria-required-attr` ("ARIA roles must have all required attributes"); `aria-hidden-focus` ("ARIA-hidden elements must not contain focusable elements") · **Human** — interaction: Does a screen reader announce the name/role/value correctly? |
|   [4.1.3](https://www.w3.org/TR/WCAG22/#status-messages) | AA | Status Messages | **AI** — vision model (BYOK, confidence ≥ 0.8) |

## WCAG 2.1 AAA

| SC | Level | Title | Methodology |
|---|---|---|---|
| ✓ [1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) | A | Non-text Content | **Compute** — `image-alt` ("Images must have alternate text"); `input-image-alt` ("Image buttons must have alternate text"); `object-alt` ("Object elements must have alternate text"); `svg-img-alt` ("SVG images must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the alternative text a faithful, meaningful description of each image's content/function, with a longer description where needed? |
| ✓ [1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) | A | Audio-only and Video-only (Prerecorded) | **Compute** — `media-transcript` ("Audio/video-only media must have a transcript") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.2.2](https://www.w3.org/TR/WCAG22/#captions-prerecorded) | A | Captions (Prerecorded) | **Compute** — `video-caption` ("Video elements must have captions") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.3](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) | A | Audio Description or Media Alternative (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.4](https://www.w3.org/TR/WCAG22/#captions-live) | AA | Captions (Live) | **Not machine-checked** — feature-flag applicability; unresolved |
|   [1.2.5](https://www.w3.org/TR/WCAG22/#audio-description-prerecorded) | AA | Audio Description (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.6](https://www.w3.org/TR/WCAG22/#sign-language-prerecorded) | AAA | Sign Language (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.7](https://www.w3.org/TR/WCAG22/#extended-audio-description-prerecorded) | AAA | Extended Audio Description (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.8](https://www.w3.org/TR/WCAG22/#media-alternative-prerecorded) | AAA | Media Alternative (Prerecorded) | **Human** — editorial: Does the text alternative present equivalent information to the prerecorded media? |
|   [1.2.9](https://www.w3.org/TR/WCAG22/#audio-only-live) | AAA | Audio-only (Live) | **Not machine-checked** — feature-flag applicability; unresolved |
| ✓ [1.3.1](https://www.w3.org/TR/WCAG22/#info-and-relationships) | A | Info and Relationships | **Compute** — `list` ("<ul> and <ol> must directly contain only <li> elements"); `listitem` ("<li> elements must be contained in a <ul> or <ol>"); `dlitem` ("<dt> and <dd> must be inside a <dl>"); `definition-list` ("<dl> must contain only <dt> and <dd> groups"); `region` ("All page content should be contained by landmarks"); `landmark-unique` ("Repeated landmarks must have unique labels"); `heading-order` ("Heading levels should only increase by one") · **Human** — interaction: Does a screen reader announce the relationships/structure correctly? |
|   [1.3.2](https://www.w3.org/TR/WCAG22/#meaningful-sequence) | A | Meaningful Sequence | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [1.3.3](https://www.w3.org/TR/WCAG22/#sensory-characteristics) | A | Sensory Characteristics | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.3.4](https://www.w3.org/TR/WCAG22/#orientation) | AA | Orientation | **Compute** — `orientation` ("Content must work in both portrait and landscape orientation") |
| ✓ [1.3.5](https://www.w3.org/TR/WCAG22/#identify-input-purpose) | AA | Identify Input Purpose | **Compute** — `autocomplete-valid` ("Input purpose must use a valid autocomplete value") |
|   [1.3.6](https://www.w3.org/TR/WCAG22/#identify-purpose) | AAA | Identify Purpose | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.1](https://www.w3.org/TR/WCAG22/#use-of-color) | A | Use of Color | **Compute** — `use-of-color` ("Color must not be the only means of conveying information") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.2](https://www.w3.org/TR/WCAG22/#audio-control) | A | Audio Control | **Compute** — `no-autoplay-audio` ("Auto-playing audio must not play for more than 3 seconds without a control") |
| ✓ [1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) | AA | Contrast (Minimum) | **Compute** — `color-contrast` ("Text must have sufficient color contrast") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
| ✓ [1.4.4](https://www.w3.org/TR/WCAG22/#resize-text) | AA | Resize Text | **Compute** — `meta-viewport` ("Zooming and scaling must not be disabled") |
|   [1.4.5](https://www.w3.org/TR/WCAG22/#images-of-text) | AA | Images of Text | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.6](https://www.w3.org/TR/WCAG22/#contrast-enhanced) | AAA | Contrast (Enhanced) | **Compute** — `contrast-enhanced` ("Text must have enhanced color contrast (7:1, 4.5:1 large)") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
|   [1.4.7](https://www.w3.org/TR/WCAG22/#low-or-no-background-audio) | AAA | Low or No Background Audio | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.4.8](https://www.w3.org/TR/WCAG22/#visual-presentation) | AAA | Visual Presentation | **Human** — editorial: Do the visual-presentation controls meet the required thresholds? |
|   [1.4.9](https://www.w3.org/TR/WCAG22/#images-of-text-no-exception) | AAA | Images of Text (No Exception) | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.10](https://www.w3.org/TR/WCAG22/#reflow) | AA | Reflow | **Compute (interaction)** — viewport 320px; fail if `scrollWidth > innerWidth + 1` |
| ✓ [1.4.11](https://www.w3.org/TR/WCAG22/#non-text-contrast) | AA | Non-text Contrast | **Compute** — `non-text-contrast` ("UI component borders and indicators must have 3:1 contrast") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
| ✓ [1.4.12](https://www.w3.org/TR/WCAG22/#text-spacing) | AA | Text Spacing | **Compute** — `text-spacing` ("Line/letter/word spacing overrides must not be blocked") |
|   [1.4.13](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus) | AA | Content on Hover or Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.1.1](https://www.w3.org/TR/WCAG22/#keyboard) | A | Keyboard | **Compute** — `click-events-have-key-events` ("Clickable elements must also be keyboard operable") |
| ✓ [2.1.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) | A | No Keyboard Trap | **Compute (interaction)** — Tab ≤20×; fail if many focusable but only 1 distinct focus target |
|   [2.1.3](https://www.w3.org/TR/WCAG22/#keyboard-no-exception) | AAA | Keyboard (No Exception) | **Human** — interaction: Can the entire content be operated from the keyboard alone, with no exception? |
|   [2.1.4](https://www.w3.org/TR/WCAG22/#character-key-shortcuts) | A | Character Key Shortcuts | **Human** — interaction: Do single-character shortcuts meet the turn-off/remap/active-only rule? |
| ✓ [2.2.1](https://www.w3.org/TR/WCAG22/#timing-adjustable) | A | Timing Adjustable | **Compute** — `meta-refresh` ("Timed refresh must not be used") |
| ✓ [2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide) | A | Pause, Stop, Hide | **Compute** — `pause-stop-hide` ("Moving content must be pausable") |
| ✓ [2.2.3](https://www.w3.org/TR/WCAG22/#no-timing) | AAA | No Timing | **Compute** — `no-timing` ("Timing must not be essential to the content") |
|   [2.2.4](https://www.w3.org/TR/WCAG22/#interruptions) | AAA | Interruptions | **Human** — temporal: Can interruptions be postponed or suppressed by the user? |
|   [2.2.5](https://www.w3.org/TR/WCAG22/#re-authenticating) | AAA | Re-authenticating | **Human** — temporal: Is entered data preserved when re-authenticating after a session expiry? |
|   [2.2.6](https://www.w3.org/TR/WCAG22/#timeouts) | AAA | Timeouts | **Human** — temporal: Is the timeout essential, or does the user get a warning/extension? |
|   [2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) | A | Three Flashes or Below Threshold | **Human** — temporal: Does anything flash more than three times per second? |
|   [2.3.2](https://www.w3.org/TR/WCAG22/#three-flashes) | AAA | Three Flashes | **Human** — temporal: Does anything flash more than three times per second? |
|   [2.3.3](https://www.w3.org/TR/WCAG22/#animation-from-interactions) | AAA | Animation from Interactions | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.1](https://www.w3.org/TR/WCAG22/#bypass-blocks) | A | Bypass Blocks | **Compute** — `skip-link` ("Page should provide a skip link to main content") |
| ✓ [2.4.2](https://www.w3.org/TR/WCAG22/#page-titled) | A | Page Titled | **Compute** — `document-title` ("Documents must have a title") |
| ✓ [2.4.3](https://www.w3.org/TR/WCAG22/#focus-order) | A | Focus Order | **Compute** — `tabindex` ("Elements should not have tabindex greater than zero") |
| ✓ [2.4.4](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) | A | Link Purpose (In Context) | **Compute** — `link-name` ("Links must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.5](https://www.w3.org/TR/WCAG22/#multiple-ways) | AA | Multiple Ways | **Compute** — `multiple-ways` ("Pages must be reachable in more than one way") |
| ✓ [2.4.6](https://www.w3.org/TR/WCAG22/#headings-and-labels) | AA | Headings and Labels | **Compute** — `empty-heading` ("Headings must not be empty") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.7](https://www.w3.org/TR/WCAG22/#focus-visible) | AA | Focus Visible | **Compute** — `focus-visible` ("Keyboard focus must be visibly indicated") |
| ✓ [2.4.8](https://www.w3.org/TR/WCAG22/#location) | AAA | Location | **Compute** — `location` ("The user's location in the site must be identifiable") |
|   [2.4.9](https://www.w3.org/TR/WCAG22/#link-purpose-link-only) | AAA | Link Purpose (Link Only) | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.10](https://www.w3.org/TR/WCAG22/#section-headings) | AAA | Section Headings | **Compute** — `section-headings` ("Sections of content must have headings") |
|   [2.5.1](https://www.w3.org/TR/WCAG22/#pointer-gestures) | A | Pointer Gestures | **Human** — interaction: Is a single-pointer alternative available for every path-based gesture? |
| ✓ [2.5.2](https://www.w3.org/TR/WCAG22/#pointer-cancellation) | A | Pointer Cancellation | **Compute** — `pointer-cancellation` ("Functions must be activated on pointer-up or be cancellable") |
| ✓ [2.5.3](https://www.w3.org/TR/WCAG22/#label-in-name) | A | Label in Name | **Compute** — `label-in-name` ("The accessible name must contain the visible label") |
|   [2.5.4](https://www.w3.org/TR/WCAG22/#motion-actuation) | A | Motion Actuation | **Human** — interaction: Is motion actuation non-essential, or is an alternative provided / can it be disabled? |
| ✓ [2.5.5](https://www.w3.org/TR/WCAG22/#target-size-enhanced) | AAA | Target Size (Enhanced) | **Compute** — `target-size-enhanced` ("Interactive targets must be at least 44x44 CSS pixels") |
|   [2.5.6](https://www.w3.org/TR/WCAG22/#concurrent-input-mechanisms) | AAA | Concurrent Input Mechanisms | **Human** — interaction: Can the user use concurrent input mechanisms (e.g. touch + keyboard)? |
| ✓ [3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) | A | Language of Page | **Compute** — `html-has-lang` ("<html> element must have a lang attribute"); `html-lang-valid` ("<html> element must have a valid lang value") |
| ✓ [3.1.2](https://www.w3.org/TR/WCAG22/#language-of-parts) | AA | Language of Parts | **Compute** — `lang-of-parts` ("Passages in another language must be marked with lang") |
|   [3.1.3](https://www.w3.org/TR/WCAG22/#unusual-words) | AAA | Unusual Words | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.1.4](https://www.w3.org/TR/WCAG22/#abbreviations) | AAA | Abbreviations | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.1.5](https://www.w3.org/TR/WCAG22/#reading-level) | AAA | Reading Level | **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the prose at an appropriate reading level for the audience (or is a plain-language version provided)? |
|   [3.1.6](https://www.w3.org/TR/WCAG22/#pronunciation) | AAA | Pronunciation | **Human** — editorial: Where pronunciation affects meaning, is a mechanism provided? |
|   [3.2.1](https://www.w3.org/TR/WCAG22/#on-focus) | A | On Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.2](https://www.w3.org/TR/WCAG22/#on-input) | A | On Input | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.3](https://www.w3.org/TR/WCAG22/#consistent-navigation) | AA | Consistent Navigation | **Human** — multipage: Is the navigation order/position consistent across pages? |
|   [3.2.4](https://www.w3.org/TR/WCAG22/#consistent-identification) | AA | Consistent Identification | **Human** — multipage: Are components with the same function identified consistently across pages? |
|   [3.2.5](https://www.w3.org/TR/WCAG22/#change-on-request) | AAA | Change on Request | **Human** — interaction: Is a change of context initiated only on user request, or can it be turned off? |
|   [3.3.1](https://www.w3.org/TR/WCAG22/#error-identification) | A | Error Identification | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [3.3.2](https://www.w3.org/TR/WCAG22/#labels-or-instructions) | A | Labels or Instructions | **Compute** — `label` ("Form elements must have labels") |
|   [3.3.3](https://www.w3.org/TR/WCAG22/#error-suggestion) | AA | Error Suggestion | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.3.4](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) | AA | Error Prevention (Legal, Financial, Data) | **Human** — domain: Does this flow involve a legal/financial/data commitment requiring reversible, checked, confirmed submission? |
| ✓ [3.3.5](https://www.w3.org/TR/WCAG22/#help) | AAA | Help | **Compute** — `help` ("Context-sensitive help must be available") |
|   [3.3.6](https://www.w3.org/TR/WCAG22/#error-prevention-all) | AAA | Error Prevention (All) | **Human** — domain: Does this flow involve a legal/financial/data commitment requiring reversible, checked, confirmed submission? |
| ✓ [4.1.1](https://www.w3.org/TR/WCAG21/#parsing) | A | Parsing | **Compute** — `duplicate-id` ("ID attribute values must be unique") |
| ✓ [4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value) | A | Name, Role, Value | **Compute** — `button-name` ("Buttons must have an accessible name"); `input-button-name` ("Input buttons must have an accessible name"); `select-name` ("Select elements must have an accessible name"); `frame-title` ("Frames must have a title"); `aria-roles` ("ARIA roles used must conform to valid values"); `aria-valid-attr-value` ("ARIA attributes must have valid values"); `aria-required-attr` ("ARIA roles must have all required attributes"); `aria-hidden-focus` ("ARIA-hidden elements must not contain focusable elements") · **Human** — interaction: Does a screen reader announce the name/role/value correctly? |
|   [4.1.3](https://www.w3.org/TR/WCAG22/#status-messages) | AA | Status Messages | **AI** — vision model (BYOK, confidence ≥ 0.8) |

## WCAG 2.2 A

| SC | Level | Title | Methodology |
|---|---|---|---|
| ✓ [1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) | A | Non-text Content | **Compute** — `image-alt` ("Images must have alternate text"); `input-image-alt` ("Image buttons must have alternate text"); `object-alt` ("Object elements must have alternate text"); `svg-img-alt` ("SVG images must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the alternative text a faithful, meaningful description of each image's content/function, with a longer description where needed? |
| ✓ [1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) | A | Audio-only and Video-only (Prerecorded) | **Compute** — `media-transcript` ("Audio/video-only media must have a transcript") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.2.2](https://www.w3.org/TR/WCAG22/#captions-prerecorded) | A | Captions (Prerecorded) | **Compute** — `video-caption` ("Video elements must have captions") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.3](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) | A | Audio Description or Media Alternative (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.3.1](https://www.w3.org/TR/WCAG22/#info-and-relationships) | A | Info and Relationships | **Compute** — `list` ("<ul> and <ol> must directly contain only <li> elements"); `listitem` ("<li> elements must be contained in a <ul> or <ol>"); `dlitem` ("<dt> and <dd> must be inside a <dl>"); `definition-list` ("<dl> must contain only <dt> and <dd> groups"); `region` ("All page content should be contained by landmarks"); `landmark-unique` ("Repeated landmarks must have unique labels"); `heading-order` ("Heading levels should only increase by one") · **Human** — interaction: Does a screen reader announce the relationships/structure correctly? |
|   [1.3.2](https://www.w3.org/TR/WCAG22/#meaningful-sequence) | A | Meaningful Sequence | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [1.3.3](https://www.w3.org/TR/WCAG22/#sensory-characteristics) | A | Sensory Characteristics | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.1](https://www.w3.org/TR/WCAG22/#use-of-color) | A | Use of Color | **Compute** — `use-of-color` ("Color must not be the only means of conveying information") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.2](https://www.w3.org/TR/WCAG22/#audio-control) | A | Audio Control | **Compute** — `no-autoplay-audio` ("Auto-playing audio must not play for more than 3 seconds without a control") |
| ✓ [2.1.1](https://www.w3.org/TR/WCAG22/#keyboard) | A | Keyboard | **Compute** — `click-events-have-key-events` ("Clickable elements must also be keyboard operable") |
| ✓ [2.1.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) | A | No Keyboard Trap | **Compute (interaction)** — Tab ≤20×; fail if many focusable but only 1 distinct focus target |
|   [2.1.4](https://www.w3.org/TR/WCAG22/#character-key-shortcuts) | A | Character Key Shortcuts | **Human** — interaction: Do single-character shortcuts meet the turn-off/remap/active-only rule? |
| ✓ [2.2.1](https://www.w3.org/TR/WCAG22/#timing-adjustable) | A | Timing Adjustable | **Compute** — `meta-refresh` ("Timed refresh must not be used") |
| ✓ [2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide) | A | Pause, Stop, Hide | **Compute** — `pause-stop-hide` ("Moving content must be pausable") |
|   [2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) | A | Three Flashes or Below Threshold | **Human** — temporal: Does anything flash more than three times per second? |
| ✓ [2.4.1](https://www.w3.org/TR/WCAG22/#bypass-blocks) | A | Bypass Blocks | **Compute** — `skip-link` ("Page should provide a skip link to main content") |
| ✓ [2.4.2](https://www.w3.org/TR/WCAG22/#page-titled) | A | Page Titled | **Compute** — `document-title` ("Documents must have a title") |
| ✓ [2.4.3](https://www.w3.org/TR/WCAG22/#focus-order) | A | Focus Order | **Compute** — `tabindex` ("Elements should not have tabindex greater than zero") |
| ✓ [2.4.4](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) | A | Link Purpose (In Context) | **Compute** — `link-name` ("Links must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [2.5.1](https://www.w3.org/TR/WCAG22/#pointer-gestures) | A | Pointer Gestures | **Human** — interaction: Is a single-pointer alternative available for every path-based gesture? |
| ✓ [2.5.2](https://www.w3.org/TR/WCAG22/#pointer-cancellation) | A | Pointer Cancellation | **Compute** — `pointer-cancellation` ("Functions must be activated on pointer-up or be cancellable") |
| ✓ [2.5.3](https://www.w3.org/TR/WCAG22/#label-in-name) | A | Label in Name | **Compute** — `label-in-name` ("The accessible name must contain the visible label") |
|   [2.5.4](https://www.w3.org/TR/WCAG22/#motion-actuation) | A | Motion Actuation | **Human** — interaction: Is motion actuation non-essential, or is an alternative provided / can it be disabled? |
| ✓ [3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) | A | Language of Page | **Compute** — `html-has-lang` ("<html> element must have a lang attribute"); `html-lang-valid` ("<html> element must have a valid lang value") |
|   [3.2.1](https://www.w3.org/TR/WCAG22/#on-focus) | A | On Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.2](https://www.w3.org/TR/WCAG22/#on-input) | A | On Input | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.6](https://www.w3.org/TR/WCAG22/#consistent-help) | A | Consistent Help | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.3.1](https://www.w3.org/TR/WCAG22/#error-identification) | A | Error Identification | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [3.3.2](https://www.w3.org/TR/WCAG22/#labels-or-instructions) | A | Labels or Instructions | **Compute** — `label` ("Form elements must have labels") |
| ✓ [3.3.7](https://www.w3.org/TR/WCAG22/#redundant-entry) | A | Redundant Entry | **Compute** — `redundant-entry` ("Repeated information must not be re-entered unnecessarily") |
| ✓ [4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value) | A | Name, Role, Value | **Compute** — `button-name` ("Buttons must have an accessible name"); `input-button-name` ("Input buttons must have an accessible name"); `select-name` ("Select elements must have an accessible name"); `frame-title` ("Frames must have a title"); `aria-roles` ("ARIA roles used must conform to valid values"); `aria-valid-attr-value` ("ARIA attributes must have valid values"); `aria-required-attr` ("ARIA roles must have all required attributes"); `aria-hidden-focus` ("ARIA-hidden elements must not contain focusable elements") · **Human** — interaction: Does a screen reader announce the name/role/value correctly? |

## WCAG 2.2 AA

| SC | Level | Title | Methodology |
|---|---|---|---|
| ✓ [1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) | A | Non-text Content | **Compute** — `image-alt` ("Images must have alternate text"); `input-image-alt` ("Image buttons must have alternate text"); `object-alt` ("Object elements must have alternate text"); `svg-img-alt` ("SVG images must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the alternative text a faithful, meaningful description of each image's content/function, with a longer description where needed? |
| ✓ [1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) | A | Audio-only and Video-only (Prerecorded) | **Compute** — `media-transcript` ("Audio/video-only media must have a transcript") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.2.2](https://www.w3.org/TR/WCAG22/#captions-prerecorded) | A | Captions (Prerecorded) | **Compute** — `video-caption` ("Video elements must have captions") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.3](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) | A | Audio Description or Media Alternative (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.4](https://www.w3.org/TR/WCAG22/#captions-live) | AA | Captions (Live) | **Not machine-checked** — feature-flag applicability; unresolved |
|   [1.2.5](https://www.w3.org/TR/WCAG22/#audio-description-prerecorded) | AA | Audio Description (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.3.1](https://www.w3.org/TR/WCAG22/#info-and-relationships) | A | Info and Relationships | **Compute** — `list` ("<ul> and <ol> must directly contain only <li> elements"); `listitem` ("<li> elements must be contained in a <ul> or <ol>"); `dlitem` ("<dt> and <dd> must be inside a <dl>"); `definition-list` ("<dl> must contain only <dt> and <dd> groups"); `region` ("All page content should be contained by landmarks"); `landmark-unique` ("Repeated landmarks must have unique labels"); `heading-order` ("Heading levels should only increase by one") · **Human** — interaction: Does a screen reader announce the relationships/structure correctly? |
|   [1.3.2](https://www.w3.org/TR/WCAG22/#meaningful-sequence) | A | Meaningful Sequence | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [1.3.3](https://www.w3.org/TR/WCAG22/#sensory-characteristics) | A | Sensory Characteristics | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.3.4](https://www.w3.org/TR/WCAG22/#orientation) | AA | Orientation | **Compute** — `orientation` ("Content must work in both portrait and landscape orientation") |
| ✓ [1.3.5](https://www.w3.org/TR/WCAG22/#identify-input-purpose) | AA | Identify Input Purpose | **Compute** — `autocomplete-valid` ("Input purpose must use a valid autocomplete value") |
| ✓ [1.4.1](https://www.w3.org/TR/WCAG22/#use-of-color) | A | Use of Color | **Compute** — `use-of-color` ("Color must not be the only means of conveying information") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.2](https://www.w3.org/TR/WCAG22/#audio-control) | A | Audio Control | **Compute** — `no-autoplay-audio` ("Auto-playing audio must not play for more than 3 seconds without a control") |
| ✓ [1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) | AA | Contrast (Minimum) | **Compute** — `color-contrast` ("Text must have sufficient color contrast") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
| ✓ [1.4.4](https://www.w3.org/TR/WCAG22/#resize-text) | AA | Resize Text | **Compute** — `meta-viewport` ("Zooming and scaling must not be disabled") |
|   [1.4.5](https://www.w3.org/TR/WCAG22/#images-of-text) | AA | Images of Text | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.10](https://www.w3.org/TR/WCAG22/#reflow) | AA | Reflow | **Compute (interaction)** — viewport 320px; fail if `scrollWidth > innerWidth + 1` |
| ✓ [1.4.11](https://www.w3.org/TR/WCAG22/#non-text-contrast) | AA | Non-text Contrast | **Compute** — `non-text-contrast` ("UI component borders and indicators must have 3:1 contrast") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
| ✓ [1.4.12](https://www.w3.org/TR/WCAG22/#text-spacing) | AA | Text Spacing | **Compute** — `text-spacing` ("Line/letter/word spacing overrides must not be blocked") |
|   [1.4.13](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus) | AA | Content on Hover or Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.1.1](https://www.w3.org/TR/WCAG22/#keyboard) | A | Keyboard | **Compute** — `click-events-have-key-events` ("Clickable elements must also be keyboard operable") |
| ✓ [2.1.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) | A | No Keyboard Trap | **Compute (interaction)** — Tab ≤20×; fail if many focusable but only 1 distinct focus target |
|   [2.1.4](https://www.w3.org/TR/WCAG22/#character-key-shortcuts) | A | Character Key Shortcuts | **Human** — interaction: Do single-character shortcuts meet the turn-off/remap/active-only rule? |
| ✓ [2.2.1](https://www.w3.org/TR/WCAG22/#timing-adjustable) | A | Timing Adjustable | **Compute** — `meta-refresh` ("Timed refresh must not be used") |
| ✓ [2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide) | A | Pause, Stop, Hide | **Compute** — `pause-stop-hide` ("Moving content must be pausable") |
|   [2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) | A | Three Flashes or Below Threshold | **Human** — temporal: Does anything flash more than three times per second? |
| ✓ [2.4.1](https://www.w3.org/TR/WCAG22/#bypass-blocks) | A | Bypass Blocks | **Compute** — `skip-link` ("Page should provide a skip link to main content") |
| ✓ [2.4.2](https://www.w3.org/TR/WCAG22/#page-titled) | A | Page Titled | **Compute** — `document-title` ("Documents must have a title") |
| ✓ [2.4.3](https://www.w3.org/TR/WCAG22/#focus-order) | A | Focus Order | **Compute** — `tabindex` ("Elements should not have tabindex greater than zero") |
| ✓ [2.4.4](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) | A | Link Purpose (In Context) | **Compute** — `link-name` ("Links must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.5](https://www.w3.org/TR/WCAG22/#multiple-ways) | AA | Multiple Ways | **Compute** — `multiple-ways` ("Pages must be reachable in more than one way") |
| ✓ [2.4.6](https://www.w3.org/TR/WCAG22/#headings-and-labels) | AA | Headings and Labels | **Compute** — `empty-heading` ("Headings must not be empty") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.7](https://www.w3.org/TR/WCAG22/#focus-visible) | AA | Focus Visible | **Compute** — `focus-visible` ("Keyboard focus must be visibly indicated") |
|   [2.4.11](https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum) | AA | Focus Not Obscured (Minimum) | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [2.5.1](https://www.w3.org/TR/WCAG22/#pointer-gestures) | A | Pointer Gestures | **Human** — interaction: Is a single-pointer alternative available for every path-based gesture? |
| ✓ [2.5.2](https://www.w3.org/TR/WCAG22/#pointer-cancellation) | A | Pointer Cancellation | **Compute** — `pointer-cancellation` ("Functions must be activated on pointer-up or be cancellable") |
| ✓ [2.5.3](https://www.w3.org/TR/WCAG22/#label-in-name) | A | Label in Name | **Compute** — `label-in-name` ("The accessible name must contain the visible label") |
|   [2.5.4](https://www.w3.org/TR/WCAG22/#motion-actuation) | A | Motion Actuation | **Human** — interaction: Is motion actuation non-essential, or is an alternative provided / can it be disabled? |
| ✓ [2.5.7](https://www.w3.org/TR/WCAG22/#dragging-movements) | AA | Dragging Movements | **Compute** — `dragging-movements` ("Dragging actions must have a single-pointer alternative") |
| ✓ [2.5.8](https://www.w3.org/TR/WCAG22/#target-size-minimum) | AA | Target Size (Minimum) | **Compute** — `target-size` ("Interactive targets must be at least 24x24 CSS pixels") |
| ✓ [3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) | A | Language of Page | **Compute** — `html-has-lang` ("<html> element must have a lang attribute"); `html-lang-valid` ("<html> element must have a valid lang value") |
| ✓ [3.1.2](https://www.w3.org/TR/WCAG22/#language-of-parts) | AA | Language of Parts | **Compute** — `lang-of-parts` ("Passages in another language must be marked with lang") |
|   [3.2.1](https://www.w3.org/TR/WCAG22/#on-focus) | A | On Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.2](https://www.w3.org/TR/WCAG22/#on-input) | A | On Input | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.3](https://www.w3.org/TR/WCAG22/#consistent-navigation) | AA | Consistent Navigation | **Human** — multipage: Is the navigation order/position consistent across pages? |
|   [3.2.4](https://www.w3.org/TR/WCAG22/#consistent-identification) | AA | Consistent Identification | **Human** — multipage: Are components with the same function identified consistently across pages? |
|   [3.2.6](https://www.w3.org/TR/WCAG22/#consistent-help) | A | Consistent Help | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.3.1](https://www.w3.org/TR/WCAG22/#error-identification) | A | Error Identification | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [3.3.2](https://www.w3.org/TR/WCAG22/#labels-or-instructions) | A | Labels or Instructions | **Compute** — `label` ("Form elements must have labels") |
|   [3.3.3](https://www.w3.org/TR/WCAG22/#error-suggestion) | AA | Error Suggestion | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.3.4](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) | AA | Error Prevention (Legal, Financial, Data) | **Human** — domain: Does this flow involve a legal/financial/data commitment requiring reversible, checked, confirmed submission? |
| ✓ [3.3.7](https://www.w3.org/TR/WCAG22/#redundant-entry) | A | Redundant Entry | **Compute** — `redundant-entry` ("Repeated information must not be re-entered unnecessarily") |
|   [3.3.8](https://www.w3.org/TR/WCAG22/#accessible-authentication-minimum) | AA | Accessible Authentication (Minimum) | **Human** — domain: Does the login use a cognitive-function test? Is an alternative or object-recognition method present? |
| ✓ [4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value) | A | Name, Role, Value | **Compute** — `button-name` ("Buttons must have an accessible name"); `input-button-name` ("Input buttons must have an accessible name"); `select-name` ("Select elements must have an accessible name"); `frame-title` ("Frames must have a title"); `aria-roles` ("ARIA roles used must conform to valid values"); `aria-valid-attr-value` ("ARIA attributes must have valid values"); `aria-required-attr` ("ARIA roles must have all required attributes"); `aria-hidden-focus` ("ARIA-hidden elements must not contain focusable elements") · **Human** — interaction: Does a screen reader announce the name/role/value correctly? |
|   [4.1.3](https://www.w3.org/TR/WCAG22/#status-messages) | AA | Status Messages | **AI** — vision model (BYOK, confidence ≥ 0.8) |

## WCAG 2.2 AAA

| SC | Level | Title | Methodology |
|---|---|---|---|
| ✓ [1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) | A | Non-text Content | **Compute** — `image-alt` ("Images must have alternate text"); `input-image-alt` ("Image buttons must have alternate text"); `object-alt` ("Object elements must have alternate text"); `svg-img-alt` ("SVG images must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the alternative text a faithful, meaningful description of each image's content/function, with a longer description where needed? |
| ✓ [1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) | A | Audio-only and Video-only (Prerecorded) | **Compute** — `media-transcript` ("Audio/video-only media must have a transcript") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
| ✓ [1.2.2](https://www.w3.org/TR/WCAG22/#captions-prerecorded) | A | Captions (Prerecorded) | **Compute** — `video-caption` ("Video elements must have captions") · **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.3](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) | A | Audio Description or Media Alternative (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.4](https://www.w3.org/TR/WCAG22/#captions-live) | AA | Captions (Live) | **Not machine-checked** — feature-flag applicability; unresolved |
|   [1.2.5](https://www.w3.org/TR/WCAG22/#audio-description-prerecorded) | AA | Audio Description (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.6](https://www.w3.org/TR/WCAG22/#sign-language-prerecorded) | AAA | Sign Language (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.7](https://www.w3.org/TR/WCAG22/#extended-audio-description-prerecorded) | AAA | Extended Audio Description (Prerecorded) | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.2.8](https://www.w3.org/TR/WCAG22/#media-alternative-prerecorded) | AAA | Media Alternative (Prerecorded) | **Human** — editorial: Does the text alternative present equivalent information to the prerecorded media? |
|   [1.2.9](https://www.w3.org/TR/WCAG22/#audio-only-live) | AAA | Audio-only (Live) | **Not machine-checked** — feature-flag applicability; unresolved |
| ✓ [1.3.1](https://www.w3.org/TR/WCAG22/#info-and-relationships) | A | Info and Relationships | **Compute** — `list` ("<ul> and <ol> must directly contain only <li> elements"); `listitem` ("<li> elements must be contained in a <ul> or <ol>"); `dlitem` ("<dt> and <dd> must be inside a <dl>"); `definition-list` ("<dl> must contain only <dt> and <dd> groups"); `region` ("All page content should be contained by landmarks"); `landmark-unique` ("Repeated landmarks must have unique labels"); `heading-order` ("Heading levels should only increase by one") · **Human** — interaction: Does a screen reader announce the relationships/structure correctly? |
|   [1.3.2](https://www.w3.org/TR/WCAG22/#meaningful-sequence) | A | Meaningful Sequence | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [1.3.3](https://www.w3.org/TR/WCAG22/#sensory-characteristics) | A | Sensory Characteristics | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.3.4](https://www.w3.org/TR/WCAG22/#orientation) | AA | Orientation | **Compute** — `orientation` ("Content must work in both portrait and landscape orientation") |
| ✓ [1.3.5](https://www.w3.org/TR/WCAG22/#identify-input-purpose) | AA | Identify Input Purpose | **Compute** — `autocomplete-valid` ("Input purpose must use a valid autocomplete value") |
|   [1.3.6](https://www.w3.org/TR/WCAG22/#identify-purpose) | AAA | Identify Purpose | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.1](https://www.w3.org/TR/WCAG22/#use-of-color) | A | Use of Color | **Compute** — `use-of-color` ("Color must not be the only means of conveying information") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.2](https://www.w3.org/TR/WCAG22/#audio-control) | A | Audio Control | **Compute** — `no-autoplay-audio` ("Auto-playing audio must not play for more than 3 seconds without a control") |
| ✓ [1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) | AA | Contrast (Minimum) | **Compute** — `color-contrast` ("Text must have sufficient color contrast") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
| ✓ [1.4.4](https://www.w3.org/TR/WCAG22/#resize-text) | AA | Resize Text | **Compute** — `meta-viewport` ("Zooming and scaling must not be disabled") |
|   [1.4.5](https://www.w3.org/TR/WCAG22/#images-of-text) | AA | Images of Text | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.6](https://www.w3.org/TR/WCAG22/#contrast-enhanced) | AAA | Contrast (Enhanced) | **Compute** — `contrast-enhanced` ("Text must have enhanced color contrast (7:1, 4.5:1 large)") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
|   [1.4.7](https://www.w3.org/TR/WCAG22/#low-or-no-background-audio) | AAA | Low or No Background Audio | **AI** — audio model (BYOK, confidence ≥ 0.8) |
|   [1.4.8](https://www.w3.org/TR/WCAG22/#visual-presentation) | AAA | Visual Presentation | **Human** — editorial: Do the visual-presentation controls meet the required thresholds? |
|   [1.4.9](https://www.w3.org/TR/WCAG22/#images-of-text-no-exception) | AAA | Images of Text (No Exception) | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [1.4.10](https://www.w3.org/TR/WCAG22/#reflow) | AA | Reflow | **Compute (interaction)** — viewport 320px; fail if `scrollWidth > innerWidth + 1` |
| ✓ [1.4.11](https://www.w3.org/TR/WCAG22/#non-text-contrast) | AA | Non-text Contrast | **Compute** — `non-text-contrast` ("UI component borders and indicators must have 3:1 contrast") · *Formula:* contrast ratio (linearised relative luminance) — see appendix |
| ✓ [1.4.12](https://www.w3.org/TR/WCAG22/#text-spacing) | AA | Text Spacing | **Compute** — `text-spacing` ("Line/letter/word spacing overrides must not be blocked") |
|   [1.4.13](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus) | AA | Content on Hover or Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.1.1](https://www.w3.org/TR/WCAG22/#keyboard) | A | Keyboard | **Compute** — `click-events-have-key-events` ("Clickable elements must also be keyboard operable") |
| ✓ [2.1.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) | A | No Keyboard Trap | **Compute (interaction)** — Tab ≤20×; fail if many focusable but only 1 distinct focus target |
|   [2.1.3](https://www.w3.org/TR/WCAG22/#keyboard-no-exception) | AAA | Keyboard (No Exception) | **Human** — interaction: Can the entire content be operated from the keyboard alone, with no exception? |
|   [2.1.4](https://www.w3.org/TR/WCAG22/#character-key-shortcuts) | A | Character Key Shortcuts | **Human** — interaction: Do single-character shortcuts meet the turn-off/remap/active-only rule? |
| ✓ [2.2.1](https://www.w3.org/TR/WCAG22/#timing-adjustable) | A | Timing Adjustable | **Compute** — `meta-refresh` ("Timed refresh must not be used") |
| ✓ [2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide) | A | Pause, Stop, Hide | **Compute** — `pause-stop-hide` ("Moving content must be pausable") |
| ✓ [2.2.3](https://www.w3.org/TR/WCAG22/#no-timing) | AAA | No Timing | **Compute** — `no-timing` ("Timing must not be essential to the content") |
|   [2.2.4](https://www.w3.org/TR/WCAG22/#interruptions) | AAA | Interruptions | **Human** — temporal: Can interruptions be postponed or suppressed by the user? |
|   [2.2.5](https://www.w3.org/TR/WCAG22/#re-authenticating) | AAA | Re-authenticating | **Human** — temporal: Is entered data preserved when re-authenticating after a session expiry? |
|   [2.2.6](https://www.w3.org/TR/WCAG22/#timeouts) | AAA | Timeouts | **Human** — temporal: Is the timeout essential, or does the user get a warning/extension? |
|   [2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) | A | Three Flashes or Below Threshold | **Human** — temporal: Does anything flash more than three times per second? |
|   [2.3.2](https://www.w3.org/TR/WCAG22/#three-flashes) | AAA | Three Flashes | **Human** — temporal: Does anything flash more than three times per second? |
|   [2.3.3](https://www.w3.org/TR/WCAG22/#animation-from-interactions) | AAA | Animation from Interactions | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.1](https://www.w3.org/TR/WCAG22/#bypass-blocks) | A | Bypass Blocks | **Compute** — `skip-link` ("Page should provide a skip link to main content") |
| ✓ [2.4.2](https://www.w3.org/TR/WCAG22/#page-titled) | A | Page Titled | **Compute** — `document-title` ("Documents must have a title") |
| ✓ [2.4.3](https://www.w3.org/TR/WCAG22/#focus-order) | A | Focus Order | **Compute** — `tabindex` ("Elements should not have tabindex greater than zero") |
| ✓ [2.4.4](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) | A | Link Purpose (In Context) | **Compute** — `link-name` ("Links must have an accessible name") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.5](https://www.w3.org/TR/WCAG22/#multiple-ways) | AA | Multiple Ways | **Compute** — `multiple-ways` ("Pages must be reachable in more than one way") |
| ✓ [2.4.6](https://www.w3.org/TR/WCAG22/#headings-and-labels) | AA | Headings and Labels | **Compute** — `empty-heading` ("Headings must not be empty") · **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.7](https://www.w3.org/TR/WCAG22/#focus-visible) | AA | Focus Visible | **Compute** — `focus-visible` ("Keyboard focus must be visibly indicated") |
| ✓ [2.4.8](https://www.w3.org/TR/WCAG22/#location) | AAA | Location | **Compute** — `location` ("The user's location in the site must be identifiable") |
|   [2.4.9](https://www.w3.org/TR/WCAG22/#link-purpose-link-only) | AAA | Link Purpose (Link Only) | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [2.4.10](https://www.w3.org/TR/WCAG22/#section-headings) | AAA | Section Headings | **Compute** — `section-headings` ("Sections of content must have headings") |
|   [2.4.11](https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum) | AA | Focus Not Obscured (Minimum) | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [2.4.12](https://www.w3.org/TR/WCAG22/#focus-not-obscured-enhanced) | AAA | Focus Not Obscured (Enhanced) | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [2.4.13](https://www.w3.org/TR/WCAG22/#focus-appearance) | AAA | Focus Appearance | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [2.5.1](https://www.w3.org/TR/WCAG22/#pointer-gestures) | A | Pointer Gestures | **Human** — interaction: Is a single-pointer alternative available for every path-based gesture? |
| ✓ [2.5.2](https://www.w3.org/TR/WCAG22/#pointer-cancellation) | A | Pointer Cancellation | **Compute** — `pointer-cancellation` ("Functions must be activated on pointer-up or be cancellable") |
| ✓ [2.5.3](https://www.w3.org/TR/WCAG22/#label-in-name) | A | Label in Name | **Compute** — `label-in-name` ("The accessible name must contain the visible label") |
|   [2.5.4](https://www.w3.org/TR/WCAG22/#motion-actuation) | A | Motion Actuation | **Human** — interaction: Is motion actuation non-essential, or is an alternative provided / can it be disabled? |
| ✓ [2.5.5](https://www.w3.org/TR/WCAG22/#target-size-enhanced) | AAA | Target Size (Enhanced) | **Compute** — `target-size-enhanced` ("Interactive targets must be at least 44x44 CSS pixels") |
|   [2.5.6](https://www.w3.org/TR/WCAG22/#concurrent-input-mechanisms) | AAA | Concurrent Input Mechanisms | **Human** — interaction: Can the user use concurrent input mechanisms (e.g. touch + keyboard)? |
| ✓ [2.5.7](https://www.w3.org/TR/WCAG22/#dragging-movements) | AA | Dragging Movements | **Compute** — `dragging-movements` ("Dragging actions must have a single-pointer alternative") |
| ✓ [2.5.8](https://www.w3.org/TR/WCAG22/#target-size-minimum) | AA | Target Size (Minimum) | **Compute** — `target-size` ("Interactive targets must be at least 24x24 CSS pixels") |
| ✓ [3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) | A | Language of Page | **Compute** — `html-has-lang` ("<html> element must have a lang attribute"); `html-lang-valid` ("<html> element must have a valid lang value") |
| ✓ [3.1.2](https://www.w3.org/TR/WCAG22/#language-of-parts) | AA | Language of Parts | **Compute** — `lang-of-parts` ("Passages in another language must be marked with lang") |
|   [3.1.3](https://www.w3.org/TR/WCAG22/#unusual-words) | AAA | Unusual Words | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.1.4](https://www.w3.org/TR/WCAG22/#abbreviations) | AAA | Abbreviations | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.1.5](https://www.w3.org/TR/WCAG22/#reading-level) | AAA | Reading Level | **AI** — vision model (BYOK, confidence ≥ 0.8) · **Human** — editorial: Is the prose at an appropriate reading level for the audience (or is a plain-language version provided)? |
|   [3.1.6](https://www.w3.org/TR/WCAG22/#pronunciation) | AAA | Pronunciation | **Human** — editorial: Where pronunciation affects meaning, is a mechanism provided? |
|   [3.2.1](https://www.w3.org/TR/WCAG22/#on-focus) | A | On Focus | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.2](https://www.w3.org/TR/WCAG22/#on-input) | A | On Input | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.2.3](https://www.w3.org/TR/WCAG22/#consistent-navigation) | AA | Consistent Navigation | **Human** — multipage: Is the navigation order/position consistent across pages? |
|   [3.2.4](https://www.w3.org/TR/WCAG22/#consistent-identification) | AA | Consistent Identification | **Human** — multipage: Are components with the same function identified consistently across pages? |
|   [3.2.5](https://www.w3.org/TR/WCAG22/#change-on-request) | AAA | Change on Request | **Human** — interaction: Is a change of context initiated only on user request, or can it be turned off? |
|   [3.2.6](https://www.w3.org/TR/WCAG22/#consistent-help) | A | Consistent Help | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.3.1](https://www.w3.org/TR/WCAG22/#error-identification) | A | Error Identification | **AI** — vision model (BYOK, confidence ≥ 0.8) |
| ✓ [3.3.2](https://www.w3.org/TR/WCAG22/#labels-or-instructions) | A | Labels or Instructions | **Compute** — `label` ("Form elements must have labels") |
|   [3.3.3](https://www.w3.org/TR/WCAG22/#error-suggestion) | AA | Error Suggestion | **AI** — vision model (BYOK, confidence ≥ 0.8) |
|   [3.3.4](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) | AA | Error Prevention (Legal, Financial, Data) | **Human** — domain: Does this flow involve a legal/financial/data commitment requiring reversible, checked, confirmed submission? |
| ✓ [3.3.5](https://www.w3.org/TR/WCAG22/#help) | AAA | Help | **Compute** — `help` ("Context-sensitive help must be available") |
|   [3.3.6](https://www.w3.org/TR/WCAG22/#error-prevention-all) | AAA | Error Prevention (All) | **Human** — domain: Does this flow involve a legal/financial/data commitment requiring reversible, checked, confirmed submission? |
| ✓ [3.3.7](https://www.w3.org/TR/WCAG22/#redundant-entry) | A | Redundant Entry | **Compute** — `redundant-entry` ("Repeated information must not be re-entered unnecessarily") |
|   [3.3.8](https://www.w3.org/TR/WCAG22/#accessible-authentication-minimum) | AA | Accessible Authentication (Minimum) | **Human** — domain: Does the login use a cognitive-function test? Is an alternative or object-recognition method present? |
|   [3.3.9](https://www.w3.org/TR/WCAG22/#accessible-authentication-enhanced) | AAA | Accessible Authentication (Enhanced) | **Human** — domain: Does the login use a cognitive-function test? Is an alternative or object-recognition method present? |
| ✓ [4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value) | A | Name, Role, Value | **Compute** — `button-name` ("Buttons must have an accessible name"); `input-button-name` ("Input buttons must have an accessible name"); `select-name` ("Select elements must have an accessible name"); `frame-title` ("Frames must have a title"); `aria-roles` ("ARIA roles used must conform to valid values"); `aria-valid-attr-value` ("ARIA attributes must have valid values"); `aria-required-attr` ("ARIA roles must have all required attributes"); `aria-hidden-focus` ("ARIA-hidden elements must not contain focusable elements") · **Human** — interaction: Does a screen reader announce the name/role/value correctly? |
|   [4.1.3](https://www.w3.org/TR/WCAG22/#status-messages) | AA | Status Messages | **AI** — vision model (BYOK, confidence ≥ 0.8) |

