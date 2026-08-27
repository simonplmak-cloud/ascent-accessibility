# Principle 4 · Robust — 9 rules

Back to [engine overview](README.md).

---

## button-name

**WCAG 4.1.2 Name, Role, Value — Level A · critical**

Ensures `<button>` elements have an accessible name.

- **Matcher:** `button`
- **Extract:** `{ aria, labelledby, text, title }`
- **Check `button-name`:**
  - non-empty `aria-label`, `aria-labelledby`, text, or `title` → **pass**
  - none → **fail** — "button has no accessible name"

---

## input-button-name

**WCAG 4.1.2 Name, Role, Value — Level A · serious**

Ensures `<input type="button|submit|reset">` have a name.

- **Matcher:** `input[type='button'], input[type='submit'], input[type='reset']`
- **Extract:** `{ value, aria, title }`
- **Check `input-button-name`:**
  - non-empty `value`, `aria-label`, or `title` → **pass**
  - none → **fail** — "input button has no accessible name"

---

## select-name

**WCAG 4.1.2 Name, Role, Value — Level A · serious**

Ensures `<select>` elements have a name.

- **Matcher:** `select`
- **Extract:** `{ hasFor, inLabel, aria, title }`
- **Check `select-name`:**
  - `<label for>`, wrapping label, `aria-label`, or `title` → **pass**
  - none → **fail** — "select element has no accessible name"

---

## frame-title

**WCAG 4.1.2 Name, Role, Value — Level A · serious**

Ensures `<iframe>`/`<frame>` have a `title`.

- **Matcher:** `iframe, frame`
- **Extract:** `{ title }`
- **Check `frame-title`:**
  - non-empty `title` → **pass**
  - missing → **fail** — "frame element has no title"

---

## aria-roles

**WCAG 4.1.2 Name, Role, Value — Level A · serious**

Ensures `role` values are valid ARIA roles.

- **Matcher:** `[role]`
- **Extract:** `{ roles }` — whitespace-split role tokens
- **Check `valid-roles`:**
  - every token is in the 65-role allowlist → **pass**
  - any unknown role → **fail** — "invalid ARIA role: `<role>`"

---

## aria-valid-attr-value

**WCAG 4.1.2 Name, Role, Value — Level A · serious**

Ensures enumerated ARIA attributes hold valid values.

- **Matcher:** elements with `aria-checked`, `aria-pressed`, `aria-expanded`,
  `aria-selected`, `aria-hidden`, `aria-current`, `aria-haspopup`, `aria-sort`,
  `aria-required`, `aria-invalid`, `aria-disabled`, `aria-busy`, or `aria-live`
- **Extract:** `{ attrs }` — present attributes and their values
- **Check `valid-attr-values`:**
  - each attribute's value is in its allowlist (e.g. `aria-checked ∈ true|false|mixed`,
    `aria-live ∈ off|polite|assertive`) → **pass**
  - invalid value → **fail** — "invalid value `<v>` for `<attr>`"

---

## aria-required-attr

**WCAG 4.1.2 Name, Role, Value — Level A · serious**

Ensures roles have their required ARIA attributes (e.g. `checkbox` needs
`aria-checked`, `slider` needs `aria-valuenow`).

- **Matcher:** `[role]`
- **Extract:** `{ role, attrs }` — first role token + present ARIA attributes
- **Check `required-attrs`:**
  - role has no required-attribute mapping → **pass**
  - all required attributes present → **pass**
  - a required attribute missing → **fail** — "role `<role>` is missing required attribute `<attr>`"

---

## aria-hidden-focus

**WCAG 4.1.2 Name, Role, Value — Level A · serious**

Ensures `aria-hidden="true"` elements contain no focusable descendants.

- **Matcher:** `[aria-hidden='true']`
- **Extract:** `{ hasFocusable }` — presence of a focusable descendant
  (`a[href]`, `button`, `input`, `select`, `textarea`, `iframe`, `[tabindex]`,
  `[contenteditable]`)
- **Check `aria-hidden-no-focus`:**
  - focusable descendant present → **fail** — "aria-hidden element contains a focusable descendant"
  - none → **pass**

---

## duplicate-id

**WCAG 4.1.1 Parsing — Level A · moderate**

Ensures every `id` attribute value is unique.

- **Matcher:** `null` (document-level)
- **Extract:** `{ duplicate }` — the first repeated `id` found
- **Check `unique-ids`:**
  - no duplicates → **pass**
  - a duplicate found → **fail** — "duplicate id: `<id>`"
