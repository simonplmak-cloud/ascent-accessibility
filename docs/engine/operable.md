# Principle 2 · Operable — 5 rules

Back to [engine overview](README.md).

---

## document-title

**WCAG 2.4.2 Page Titled — Level A · serious**

Ensures the document has a non-empty `<title>`.

- **Matcher:** `null` (document-level)
- **Extract:** `{ title }` — `<title>` text content
- **Check `title-non-empty`:**
  - non-empty title → **pass**
  - empty/missing → **fail** — "document has no non-empty title"

---

## link-name

**WCAG 2.4.4 Link Purpose (In Context) — Level A · serious**

Ensures links have a discernible accessible name.

- **Matcher:** `a[href]`
- **Extract:** `{ aria, labelledbyText, text, title, imgAlt }` — name from
  `aria-label`, `aria-labelledby`, text content, `title`, or a child image's `alt`
- **Check `link-name`:**
  - any of those sources is non-empty → **pass**
  - none → **fail** — "link has no discernible text"

---

## skip-link

**WCAG 2.4.1 Bypass Blocks — Level A · moderate**

Ensures a mechanism exists to bypass repeated blocks.

- **Matcher:** `null` (document-level)
- **Extract:** `{ hasMain, hasSkip }` — presence of a `main` landmark or an
  in-page anchor link (`a[href^="#"]`)
- **Check `bypass-mechanism`:**
  - `main` landmark or skip link present → **pass**
  - neither → **fail** — "no skip link or main landmark to bypass repeated blocks"

---

## tabindex

**WCAG 2.4.3 Focus Order — Level A · serious**

Ensures `tabindex` is never greater than 0 (positive tabindex disrupts natural
focus order).

- **Matcher:** `[tabindex]`
- **Extract:** `{ tabindex }` — parsed integer (default 0)
- **Check `tabindex-not-positive`:**
  - `tabindex > 0` → **fail** — "tabindex=N disrupts natural focus order"
  - otherwise → **pass**

---

## focus-visible

**WCAG 2.4.7 Focus Visible — Level AA · moderate**

Ensures keyboard focus is visibly indicated — inspects stylesheets for an outline
suppression with no visible alternative.

- **Matcher:** `null` (document-level)
- **Extract:** iterates all `:focus`/`:focus-visible` CSS rules, ignoring
  `[tabindex="-1"]` targets and skip links. Reports:
  - `suppressed` — an outline suppression with no alternate indicator
  - `hasFocusVisibleAlt` — a `:focus-visible` rule exists
  - `hasVisibleIndicator` — some focus rule draws a visible outline/shadow/border
- **Check `focus-indicator`:**
  - stylesheets unreadable → **incomplete**
  - suppressed AND no `:focus-visible` alt AND no visible indicator → **fail**
  - otherwise → **pass**
