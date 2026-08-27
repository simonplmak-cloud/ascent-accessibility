# Rendering — 4 rules (contrast, targets, timing, boundaries)

Back to [engine overview](README.md).

---

## color-contrast

**WCAG 1.4.3 Contrast (Minimum) — Level AA · serious**

Ensures text meets AA contrast (4.5:1 normal, 3:1 large text).

- **Matcher:** `p, h1..h6, li, a, button, label, td, th, figcaption, blockquote,
  dt, dd, input[type=text], input[type=search], textarea`
- **Extract:** parses the computed `color` (foreground) and walks up ancestors for
  the first opaque `background-color`; also reads `font-size` and `font-weight`.
  Returns `{ text, fg, bg, fontSize, fontWeight }`.
- **Check `contrast-minimum`:**
  - empty text → **pass**
  - foreground or background not computable → **incomplete**
  - computes the WCAG relative-luminance ratio; large text (≥24px, or ≥18.66px
    bold) has a 3:1 threshold, otherwise 4.5:1
  - ratio below threshold → **fail** — "contrast ratio X is below Y:1"
  - otherwise → **pass**

---

## target-size

**WCAG 2.5.8 Target Size (Minimum) — Level AA · serious**

Ensures interactive targets are at least 24×24 CSS pixels.

- **Matcher:** `button, [role='button'], a[href], input:not([type=hidden]), select, textarea`
- **Extract:** `{ width, height, inline }` — bounding rect dimensions, plus an
  `inline` flag for inline text links whose size is constrained by line-height
  (exempt from 2.5.8)
- **Check `target-size-minimum`:**
  - zero-size, `inline`, or ≥24×24 → **pass**
  - below 24×24 → **fail** — "target is WxH px (below 24x24)"

---

## meta-refresh

**WCAG 2.2.1 Timing Adjustable — Level A · serious**

Ensures `<meta http-equiv=refresh>` does not auto-redirect or refresh too quickly.

- **Matcher:** `meta[http-equiv='refresh' i]`
- **Extract:** `{ content }` — the `content` attribute
- **Check `refresh-timing`:**
  - contains a `url=` (redirect) → **fail** — "meta refresh redirects to another page"
  - delay < 72000s (20h) → **fail** — "meta refresh delays only Ns (below 20h)"
  - otherwise → **pass**

---

## non-text-contrast

**WCAG 1.4.11 Non-text Contrast — Level AA · serious**

Ensures UI component boundaries (borders) meet 3:1 contrast.

- **Matcher:** `input:not([type=hidden]), select, textarea, button`
- **Extract:** `{ borderStyle, width, border, bg }` — the top border's style/width/
  color and the element's background color
- **Check `boundary-contrast`:**
  - no border (style `none`/`hidden` or width ≤ 0) → **pass** (not a visible boundary)
  - border or background not computable, or transparent background → **incomplete**
  - border vs background ratio < 3 → **fail** — "component boundary contrast X is below 3:1"
  - otherwise → **pass**
