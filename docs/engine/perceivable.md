# Principle 1 · Perceivable — 14 rules

Back to [engine overview](README.md).

---

## image-alt

**WCAG 1.1.1 Non-text Content — Level A · critical**

Ensures `<img>` elements have alternate text or a decorative role.

- **Matcher:** `img`
- **Extract:** `{ alt, role }`
- **Check `alt-present-or-decorative`:**
  - `alt` attribute present → **pass**
  - `role="presentation"` or `role="none"` (decorative) → **pass**
  - otherwise → **fail** — "img element has no alt attribute"

---

## input-image-alt

**WCAG 1.1.1 Non-text Content — Level A · serious**

Ensures `<input type="image">` (image buttons) have alternate text.

- **Matcher:** `input[type='image']`
- **Extract:** `{ alt, aria }`
- **Check `image-button-name`:**
  - non-empty `alt` or `aria-label` → **pass**
  - otherwise → **fail** — "input[type=image] has no text alternative"

---

## object-alt

**WCAG 1.1.1 Non-text Content — Level A · serious**

Ensures `<object>` elements have alternate text.

- **Matcher:** `object`
- **Extract:** `{ text, aria, title }`
- **Check `object-text-alternative`:**
  - non-empty text content, `aria-label`, or `title` → **pass**
  - otherwise → **fail** — "object element has no text alternative"

---

## svg-img-alt

**WCAG 1.1.1 Non-text Content — Level A · serious**

Ensures `<svg>` elements with an image role have an accessible name.

- **Matcher:** `svg`
- **Extract:** `{ role, aria, labelledby, title }`
- **Check `svg-img-name`:**
  - role is not `img`/`graphics-document`/`graphics-symbol` → **pass** (not an image)
  - `aria-label`, `aria-labelledby`, or inner `<title>` present → **pass**
  - otherwise → **fail** — "svg with img role has no accessible name"

---

## video-caption

**WCAG 1.2.2 Captions (Prerecorded) — Level A · serious**

Ensures `<video>` elements have a captions/subtitles track.

- **Matcher:** `video`
- **Extract:** `{ hasTrack }` — presence of `<track kind="captions">` or `kind="subtitles"`
- **Check `captions-track`:**
  - track present → **pass**
  - otherwise → **fail** — "video element has no captions track"

---

## list

**WCAG 1.3.1 Info and Relationships — Level A · moderate**

Ensures `<ul>`/`<ol>` directly contain only `<li>` children.

- **Matcher:** `ul, ol`
- **Extract:** `{ children }` — child tag names (excluding `SCRIPT`/`TEMPLATE`)
- **Check `list-only-li-children`:**
  - no children, or all children are `LI` → **pass**
  - any non-`LI` child → **fail** — "list contains non-li children"

---

## listitem

**WCAG 1.3.1 Info and Relationships — Level A · moderate**

Ensures `<li>` elements are inside a list.

- **Matcher:** `li`
- **Extract:** `{ parentTag, parentRole }`
- **Check `listitem-in-list`:**
  - parent is `ul`/`ol`, or parent has role `list`/`listbox`/`menu` → **pass**
  - otherwise → **fail** — "li element is not inside a list"

---

## dlitem

**WCAG 1.3.1 Info and Relationships — Level A · moderate**

Ensures `<dt>`/`<dd>` elements are inside a `<dl>`.

- **Matcher:** `dt, dd`
- **Extract:** `{ parentTag }`
- **Check `dlitem-in-dl`:**
  - parent is `dl` → **pass**
  - otherwise → **fail** — "dt/dd element is not inside a dl"

---

## definition-list

**WCAG 1.3.1 Info and Relationships — Level A · moderate**

Ensures `<dl>` contains only `<dt>`/`<dd>`/`<div>` groups.

- **Matcher:** `dl`
- **Extract:** `{ children }` — child tag names
- **Check `dl-valid-children`:**
  - all children are `DT`/`DD`/`DIV` → **pass**
  - any invalid child → **fail** — "dl contains invalid children"

---

## region

**WCAG 1.3.1 Info and Relationships — Level AA · moderate**

Ensures page content is contained by landmarks.

- **Matcher:** `null` (document-level)
- **Extract:** `{ hasLandmark }` — presence of `main`/`nav`/`header`/`footer`/`aside` or
  equivalent `role` landmarks
- **Check `landmark-present`:**
  - a landmark exists → **pass**
  - otherwise → **fail** — "no landmark regions found"

---

## landmark-unique

**WCAG 1.3.1 Info and Relationships — Level AA · moderate**

Ensures repeated landmarks have unique labels.

- **Matcher:** `null` (document-level)
- **Extract:** counts each landmark by `role | label`; reports the first unlabelled
  duplicate role as `{ duplicate }`
- **Check `landmark-unique-label`:**
  - no duplicate unlabelled landmark → **pass**
  - duplicate found → **fail** — "duplicate unlabelled landmark: `<role>`"

---

## heading-order

**WCAG 1.3.1 Info and Relationships — Level AA · moderate**

Ensures heading levels don't skip (e.g. `h1` → `h3`).

- **Matcher:** `null` (document-level)
- **Extract:** `{ levels }` — ordered heading levels
- **Check `heading-order-no-skip`:**
  - no level jumps by more than one → **pass**
  - a skip is found → **fail** — "heading order skips from hX to hY"

---

## empty-heading

**WCAG 2.4.6 Headings and Labels — Level AA · minor**

Ensures headings have discernible text.

- **Matcher:** `h1, h2, h3, h4, h5, h6`
- **Extract:** `{ text }`
- **Check `heading-non-empty`:**
  - non-empty text → **pass**
  - empty → **fail** — "heading element is empty"

---

## meta-viewport

**WCAG 1.4.4 Resize Text — Level AA · serious**

Ensures the viewport meta tag does not disable zooming/scaling.

- **Matcher:** `meta[name='viewport']`
- **Extract:** `{ content }`
- **Check `zoom-not-disabled`:**
  - `user-scalable=no` → **fail** — "user-scalable=no disables zoom"
  - `maximum-scale` < 2 → **fail** — "maximum-scale less than 2 disables zoom"
  - otherwise → **pass**
