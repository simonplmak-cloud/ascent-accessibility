# 04 — Auditor pages (page-by-page)

Re-org of existing (`/history` + `/review` + `/assess/:id`) into a sharper workspace.
Reuses the working engine + `src/lib/review`; no new client tables.

**Density-first** (see 01 + wireframes): KPI strips, 8-column tables with tabular
numerals, master–detail always-on on md+, inline metadata — max data per viewport.

## `/auditor` — workspace dashboard (signed-in)

- **Queue health** (exceptions-first, not vanity totals): pending review, running,
  failed, completed today — each a link to the filtered list.
- **Recent activity**: latest assessments (reuse `assessment-repository` list).
- **Quick actions**: New scan (→ `/assess`), ⌘K prompt (search/commands).
- **Saved views** chips: "Failed awaiting review", "My outstanding", custom.
- `aria-live` for async counts; keyboard navigable.

## `/auditor/review` — review queue (signed-in; claim/resolve reviewer-gated)

- Master–detail: dense table on the left, finding/SC detail panel on the right.
- Columns: URL · standard · conformance · status · age · owner.
- Filters (chips): status, standard, age; **saved views**.
- Multi-select + **bulk-action bar** ("Resolve 23 selected" → Passed/Failed/NotPresent
  + note) with undo; destructive ops confirm.
- Per-row: claim (reviewer), open (→ `/auditor/report/:id`).
- j/k next/prev; Esc closes panel + restores focus; `aria-sort` on sortable headers.
- Absorbs the existing `/review` (claim/submit via `src/lib/review` state machine +
  `/api/v1/review/*` — API unchanged; add `POST /api/v1/review/bulk-resolve`).

## `/auditor/report/:id` — report (PDF download only, public, shareable)

- Header: URL (opens new tab), standard, scope, conformance badge, "X/Y SCs met".
- Score summary + conformance table + findings (grouped by severity) + evidence drawer.
- **Findings render the traceability chain** (see below) — every finding is a navigable
  path from the concrete UI element to its WCAG standard.
- Human-review checklist (Cannot-tell) + link to professional review.
- **Report download: PDF only** — a single "Download PDF" action
  (`/api/v1/assessments/:id/export?format=pdf`). No CSV, no VPAT, no other formats;
  remove the `/vpat` route and any CSV path in the export module.
- Absorbs `src/components/assessment/report.tsx` + `manual-review-checklist.tsx` unchanged
  (extended with the chain, below).

## Finding traceability chain (UI → atomic rule → category → standard)

Every finding is presented as one navigable chain — the auditor can trace *why* a
finding exists from the specific on-page element up to the WCAG standard, and drill
into any link:

```
UI element        atomic rule          WCAG category        WCAG standard
button.btn—×     → color-contrast     → Perceivable        → 1.4.3 Contrast (AA)
[#site .btn]       [rule desc + help]   [principle]           [/standards/1.4.3]
```

| Level | Source (already in data) | Navigable action |
|---|---|---|
| Website UI | `finding.instances[].target` (selector) + `html` (snippet) + `pageUrl` | focus/expand element → show HTML + screenshot evidence drawer |
| Atomic rule | `finding.ruleId` + rule `description`/`help` (from `src/lib/engine/*`) | expand rule → description + checks |
| WCAG category | `principleName(getSc(sc).principle)` (Perceivable/Operable/Understandable/Robust) | filter the findings view to that principle |
| WCAG standard | `finding.wcagSc[]` | deep-link to `/standards/{sc}` |

Also offer a **"Browse by WCAG"** grouping toggle on the findings list:
`category → standard → atomic rule → UI instances`, so auditors can read a standard
top-down and jump to the exact elements that fail it.

No schema change — all four levels already exist on the finding + engine rule +
`src/lib/standards/*`; this is a rendering/navigation layer.

## Efficiency contract (shared with 05)

Keyboard-first, dense tables, bulk bar, saved views, master-detail, ⌘K — all applied
here first, then reused by training where relevant.
