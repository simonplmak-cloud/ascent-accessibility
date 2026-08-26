# 05 — Component catalog

Shared efficiency primitives (Phase A) + pillar components. All built on
`src/components/ui/*` and `terminal.*`; no shadcn; inline SVG icons.

## Efficiency primitives (`src/components/efficiency/`)

| Component | Props (key) | Behavior / a11y |
|---|---|---|
| `CommandPalette` | `commands: Command[]`, `onClose` | ⌘K; `role="dialog"` + labelled `combobox`; fuzzy; Arrow/Enter; Esc restores focus; shortcut hints |
| `KeyboardProvider` | `shortcuts`, children | `?` overlay; ignore unmodified keys in text fields; `aria-keyshortcuts` |
| `DenseTable` | `columns`, `rows`, `sort`, `filters`, `onSelect` | semantic `<table>`, `aria-sort`, sticky header, filter chips, URL state |
| `BulkActionBar` | `count`, `actions[]`, `onUndo` | "N selected"; reversible → undo; destructive → confirm; aria-live count |
| `SavedViews` | `views`, `active`, `onSave/Apply/Reset` | personal views; stable URL; rename/duplicate/default |
| `MasterDetail` | `list`, `detail`, `onSelect`, `onClose` | j/k; Esc close + focus restore; next/prev; `aside` landmark |
| `ScanProgress` | `stage`, `done`, `total`, `elapsed`, `onCancel` | polite aria-live; cancel; per-stage text |

## Training components (`src/components/training/`)

| Component | Notes |
|---|---|
| `TrainingDashboard` | Continue-learning card (dominant), active paths, credentials |
| `PathOverview` | fractions ("18/24"), two-line completion vs assessment |
| `LessonPlayer` | markdown + SC-reference template; Complete/Next; keyboard-advance; saved indicator |
| `QuizRunner` | start card, one-question screens, explanatory feedback, results/retry |
| `CertificateView` + `CertificateDocument` | HTML + react-pdf; verification URL |

## Auditor components (`src/components/auditor/`)

| Component | Source (moved/renamed) |
|---|---|
| `AuditorWorkspace` | `history-page-client.tsx` (extended: queue health + quick actions) |
| `AssessmentTable` | `history-table.tsx` (+ selection/bulk/saved views) |
| `ScoreComparison` | `score-comparison.tsx` |
| `ReviewQueue` | `review-queue.tsx` (+ master-detail/bulk) |
| `ReportView` | `assessment/report.tsx` (unchanged, relocated under `/auditor/report/[id]`) |
| `FindingTraceability` (new) | renders the UI → atomic rule → category → standard chain per finding; each link navigable (see 04) |
| `BrowseByWcag` (new) | grouping toggle: category → standard → rule → instances |

## Reused (unchanged)

`assessment/*` (report, conformance-table, findings-grid, finding-evidence,
score-summary, log-panel, comparison-panel, methodology, severity, types),
`ui/*`, `auth/*`, `api-keys/*`, `site/*`, `account/*`.

Every component ships empty/loading/error/success states and never uses color alone
to convey status.
