# Principle 3 · Understandable — 3 rules

Back to [engine overview](README.md).

---

## html-has-lang

**WCAG 3.1.1 Language of Page — Level A · serious**

Ensures the `<html>` element has a `lang` attribute.

- **Matcher:** `html`
- **Extract:** `{ lang }`
- **Check `lang-present`:**
  - non-empty `lang` → **pass**
  - missing/empty → **fail** — "html element has no lang attribute"

---

## html-lang-valid

**WCAG 3.1.1 Language of Page — Level A · serious**

Ensures the `lang` value is a valid BCP-47-like code.

- **Matcher:** `html`
- **Extract:** `{ lang }`
- **Check `lang-valid`:**
  - matches `/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/` → **pass**
  - otherwise → **fail** — "invalid lang value: `<lang>`"

---

## label

**WCAG 3.3.2 Labels or Instructions — Level A · critical**

Ensures every form control has a label (accessible name).

- **Matcher:** `input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]), select, textarea`
- **Extract:** `{ hasFor, inLabel, aria, labelledby, title }` — association via
  `<label for>`, a wrapping `<label>`, `aria-label`, `aria-labelledby`, or `title`
- **Check `label-associated`:**
  - any association present → **pass**
  - none → **fail** — "form element has no label"
