# Interaction — 3 rules (keyboard, pointer, dragging)

Back to [engine overview](README.md).

These are statically detected from the DOM — they flag likely interaction problems
rather than running real input.

---

## click-events-have-key-events

**WCAG 2.1.1 Keyboard — Level A · serious**

Ensures elements with click handlers (or interactive roles) are keyboard operable.

- **Matcher:** `[onclick], [role=button|link|menuitem|tab|option|switch|checkbox|radio|treeitem|listbox]`
- **Extract:** `{ tag, href, tabindex }`
- **Check `keyboard-operable`:**
  - natively focusable tag (`button`, `input`, `select`, `textarea`, `summary`) → **pass**
  - `a` with `href` → **pass**
  - has `tabindex` → **pass**
  - otherwise → **fail** — "clickable `<tag>` is not keyboard focusable (no tabindex)"

---

## pointer-cancellation

**WCAG 2.5.2 Pointer Cancellation — Level A · serious**

Ensures actions happen on pointer-up (or are cancellable), not pointer-down.

- **Matcher:** `[onmousedown], [onpointerdown], [ontouchstart]`
- **Extract:** `{ hasUp }` — presence of a matching `mouseup`/`click`/`pointerup`/`touchend` handler
- **Check `up-or-cancellable`:**
  - an up/click handler exists → **pass**
  - none → **fail** — "down-event handler without a corresponding up/click handler"

---

## dragging-movements

**WCAG 2.5.7 Dragging Movements — Level AA · serious**

Ensures drag actions have a single-pointer alternative.

- **Matcher:** `[draggable='true']`
- **Extract:** `{ hasAlt }` — presence of `onclick`, `onkeydown`/`onkeyup`, or `tabindex`
- **Check `single-pointer-alternative`:**
  - an alternative exists → **pass**
  - none → **fail** — "draggable element without a single-pointer alternative"
