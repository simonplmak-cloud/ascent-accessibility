# Gap-fill — 8 rules (AAA + presence-based SCs)

Back to [engine overview](README.md).

These rules "filled the gap" — success criteria that previously had no
machine rule. Two kinds, by design:

- **Deterministic** (contrast-enhanced, target-size-enhanced): fail on a measurable
  violation.
- **Presence-based** (the other six): pass when the required mechanism is present,
  and return **incomplete** (→ "Cannot tell") on absence — absence is never treated
  as a speculative failure.

---

## contrast-enhanced

**WCAG 1.4.6 Contrast (Enhanced) — Level AAA · serious**

Deterministic AAA contrast: 7:1 normal, 4.5:1 large text.

- **Matcher:** `p, h1..h6, li, a, button, label, td, th, figcaption, blockquote, dt,
  dd, input[type=text], input[type=search], textarea`
- **Extract:** parses computed foreground/background (walking ancestors for an
  opaque background) + font size/weight; returns `{ text, fg, bg, fontSize, fontWeight }`
- **Check `contrast-enhanced-threshold`:**
  - empty text → **pass**
  - foreground/background not computable → **incomplete**
  - large text (≥24px, or ≥18.66px bold) threshold 4.5:1, else 7:1
  - ratio below threshold → **fail** — "contrast ratio X is below Y:1"
  - otherwise → **pass**

---

## target-size-enhanced

**WCAG 2.5.5 Target Size (Enhanced) — Level AAA · serious**

Deterministic AAA target size: 44×44 CSS pixels.

- **Matcher:** `button, [role='button'], a[href], input:not([type=hidden]), select, textarea`
- **Extract:** `{ width, height, inline }` — bounding rect + an `inline` exemption
  for inline text links constrained by line-height
- **Check `target-size-enhanced-minimum`:**
  - zero-size, `inline`, or ≥44×44 → **pass**
  - below 44×44 → **fail** — "target is WxH px (below 44x44)"

---

## multiple-ways

**WCAG 2.4.5 Multiple Ways — Level AA · moderate**

Presence-based: the page is reachable by more than one navigation method.

- **Matcher:** `null` (document-level)
- **Extract:** `{ hasNav, hasSearch, hasSitemap, hasBreadcrumb }` — presence of nav
  links, a search input, a sitemap link, or breadcrumbs
- **Check `multiple-ways-present`:**
  - ≥2 mechanisms → **pass**
  - fewer → **incomplete** — "only N navigation method(s) detected"

---

## location

**WCAG 2.4.8 Location — Level AAA · moderate**

Presence-based: the user's location in the site is identifiable.

- **Matcher:** `null` (document-level)
- **Extract:** `{ hasBreadcrumb, hasCurrent }` — breadcrumb nav or `aria-current`
- **Check `location-identifiable`:**
  - breadcrumb or `aria-current` present → **pass**
  - neither → **incomplete** — "no breadcrumb or aria-current location marker found"

---

## section-headings

**WCAG 2.4.10 Section Headings — Level AAA · moderate**

Presence-based: content sections are organised with headings.

- **Matcher:** `null` (document-level)
- **Extract:** `{ sectionCount, unlabelledCount }` — `section`/`article`/`[role=region]`
  elements and how many lack a heading or `aria-label`/`aria-labelledby`
- **Check `sections-have-headings`:**
  - no sections, or all labelled → **pass**
  - unlabelled sections → **incomplete** — "N section(s) have no heading"

---

## help

**WCAG 3.3.5 Help — Level AAA · moderate**

Presence-based: context-sensitive help is available.

- **Matcher:** `null` (document-level)
- **Extract:** `{ hasHelpLink, hasDescribedBy }` — a help/contact/support/assist
  link, or any `aria-describedby`
- **Check `help-available`:**
  - a help link or `aria-describedby` present → **pass**
  - neither → **incomplete** — "no help/contact link or aria-describedby found"

---

## redundant-entry

**WCAG 3.3.7 Redundant Entry — Level AA · moderate**

Presence-based: repeated form information is not re-entered unnecessarily.

- **Matcher:** `form`
- **Extract:** `{ textInputCount, autocompleteCount }` — text-like inputs vs those
  with an `autocomplete` attribute
- **Check `autocomplete-present`:**
  - no text inputs, or at least one with `autocomplete` → **pass**
  - text inputs without `autocomplete` → **incomplete** — "form text inputs lack autocomplete attributes"

---

## no-timing

**WCAG 2.2.3 No Timing — Level AAA · moderate**

Presence-based: no time limit is essential to the content.

- **Matcher:** `null` (document-level)
- **Extract:** `{ hasMetaRefresh }` — presence of `meta[http-equiv=refresh]`
- **Check `no-meta-refresh`:**
  - no meta refresh → **pass**
  - meta refresh present → **incomplete** — "meta refresh present"
