# 06 — Interactions, keyboard & accessibility

## Keyboard map (global)

| Key | Action |
|---|---|
| ⌘K / Ctrl+K | Command palette |
| `?` | Shortcut help overlay |
| `j` / `k` | Next / prev row (lists) |
| `→` / `←` or `n` / `p` | Next / prev lesson |
| Enter | Activate / commit |
| Esc | Close palette/dialog/panel, restore focus |
| `g s` / `g a` | Go to /training · /auditor |

Rules: unmodified character keys must **not** fire while focus is in a text field;
shortcuts are discoverable via `?` + palette hints; every action has a pointer path
(keyboard-first, not keyboard-only).

## Focus & a11y contract

- Global `:focus-visible` (2px `--t-serious`, 2px offset) — do not re-style.
- Command palette: accessible dialog + labelled combobox; Arrow/Enter; Esc restores
  focus to invoker.
- Master–detail: Esc closes + restores focus to originating row; next/prev announced.
- Bulk bar: selection count in an `aria-live` region; confirm only destructive ops;
  undo for reversible.
- Dense tables: semantic `<table>` + `aria-sort`; row selection programmatically
  exposed (not color alone).
- Long jobs (scan/progress): stage/elapsed/cancel in polite `aria-live`.
- Errors: `role="alert"` + `aria-describedby` + focus first error; label text ==
  accessible name on every input.
- Landmarks: header / nav / main#main / aside / footer; one h1; ordered headings.
- Respect `prefers-reduced-motion` / `prefers-color-scheme` / `prefers-contrast`;
  logical CSS for RTL.
- Targets ≥44px (24px minimum + spacing); reflow 320px / 400% zoom with no horizontal
  page scroll (tables scroll within their region).
- Density modes (compact/high) never drop below the 24px target minimum and never
  break text zoom (1.4.4) or reflow (1.4.10).

## States matrix (every surface)

| State | Pattern |
|---|---|
| Empty | text + single primary action |
| Loading | `aria-busy` + skeleton (no layout shift) |
| Error | `role="alert"` + focus + retry |
| Success | `role="status"` / `aria-live="polite"` |

## Quiz-specific

One question per screen; "Q 3 of 8"; preserve answer on validation failure; immediate
explanatory feedback (correct/incorrect + why + remediation link); retry-missed +
retake (best score preserved); no surprise timer; Back not disabled unless sequence
matters.
