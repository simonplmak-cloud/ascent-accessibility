# 01 — Design System

The existing terminal theme is the single source of truth. This doc records the
tokens and the **efficiency patterns** the new surfaces must reuse — the coding agent
builds on `src/components/ui/*` and `terminal.*`, never a new design language.

## Tokens (already in `tailwind.config.ts` + `globals.css`)

| Role | Class | Dark value |
|---|---|---|
| Background | `bg-terminal-bg` | `11 15 20` (#0b0f14) |
| Surface | `bg-terminal-surface` | `17 24 32` (#111820) |
| Border | `border-terminal-border` | `42 53 66` (#2a3542) |
| Foreground | `text-terminal-fg` | `230 237 243` (#e6edf3) |
| Muted | `text-terminal-muted` | `157 167 176` (#9da7b0) |
| critical / serious / moderate / minor | `text-terminal-{x}` | #ff7b72 / #ffa657 / #e3b341 / #9da7b0 |
| pass / partial / fail | `text-terminal-{x}` | #3fb950 / #e3b341 / #ff7b72 |

Typography: `font-mono` everywhere. Focus: global `:focus-visible` (2px solid
`--t-serious`, 2px offset) is already set — do not re-style.

## Primitives (reuse, do not re-roll)

`Button`/`ButtonLink` (primary/outline/ghost, sm/md/lg), `Card`, `PageShell`,
`PageHeading`, `MutedText`, `InlineLink` — in `src/components/ui/`.

## Efficiency patterns (new, shared)

| Pattern | Component | Contract |
|---|---|---|
| Command palette | `CommandPalette` | ⌘K / Ctrl+K; accessible combobox; fuzzy; verb–object ("Resolve 23 selected"); shortcut hints; context-rank first; Esc restores focus |
| Keyboard map | `KeyboardProvider` | `?` help overlay; ignore unmodified keys while in text fields; no traps |
| Dense table | `DenseTable` | semantic `<table>`; sticky header; multi-sort (`aria-sort`); filter chips; column pin; URL-encoded state |
| Bulk bar | `BulkActionBar` | selection count ("23 selected"); reversible → undo; destructive → confirm; aria-live count |
| Saved views | `SavedViews` | personal filters/sort/columns; stable URL; rename/duplicate/default |
| Master–detail | `MasterDetail` | list + side panel; j/k; Esc closes + focus restore; next/prev |
| Progress (long job) | `ScanProgress` | stage + elapsed + cancel; polite aria-live |
| Split list/detail | — | `aside` landmark, not a popover |

## Data density

Bloomberg-terminal density — pack information, not padding. Every data view shows
the maximum actionable information in the first viewport.

- **Row height** 24–28px (compact default); 6–8px cell padding; no generous whitespace.
- **Tabular numerals** — `font-variant-numeric: tabular-nums` on all numeric columns
  (score, band, SC counts, dates) so columns align.
- **More columns** — tables carry the full record (URL · standard · scope · score ·
  band · SCs met/applicable · status · age · owner · actions) with column pin +
  hide/show + saved density.
- **KPI strip** — a one-line stat row (Pending 23 · Running 4 · Failed 2 · Done 31)
  with deltas; each stat is a filter link into the table.
- **Master–detail always-on** on md+ — list + side panel side by side, no modal
  round-trip.
- **Inline metadata** — URL · standard · scope · date on one muted line under headings.
- **Density toggle** — compact (default) / high (expert) / comfortable (opt-in),
  persisted per user + per saved view.
- **Guardrail** — density never drops below WCAG 2.5.8 (24px targets + spacing),
  never breaks text zoom (1.4.4) or reflow (1.4.10); keyboard-first at every density.

## States (every component)

Empty · loading (`aria-busy`) · error (`role="alert"`) · success (`role="status"`).
Never color-only: pair status color with text.
