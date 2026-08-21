# 07 — Refactor Tasks, Test Matrix & Coverage Ledger

## Phase A — Efficiency primitives + auditor re-org (highest value, reuses working engine)

- **A1.** Shared efficiency primitives — `src/lib/efficiency/*` + `src/components/efficiency/*`: `CommandPalette` (⌘K), `KeyboardProvider` + `?` help, `BulkActionBar`, `DenseTable`, `SavedViews`, `MasterDetail`.
  - *Tests (L1)*: keyboard-map collision detection + ignore-in-text-field; palette ranking/filter; saved-view serialization.
- **A2.** Move/repoint: `history-table.tsx`→`auditor/assessment-table.tsx`, `score-comparison.tsx`→`auditor/`, `history-page-client.tsx`→`auditor/auditor-workspace.tsx`, `review-queue.tsx`→`auditor/review-queue.tsx`; relabel links `/assess/${id}`→`/auditor/report/${id}`.
- **A3.** Routes `/auditor` (workspace) + `/auditor/review` + `/auditor/report/[id]`; **merge `/site` into `/assess`** (scope toggle single | whole in the assessment form); delete `app/history`, `app/review`, `app/assess/[id]`, `app/site`.
- **A4.** Bulk resolve — `POST /api/v1/review/bulk-resolve` reusing `src/lib/review`.
  - *Tests (L1/L2)*: invalid transitions, unresolved-SC guard, partial-failure/retry; route handler with fake repo.
- **A5.** Middleware: gate `/assess` and `/auditor` (single scan + whole-site scope are both login-gated via the merged `/assess`); shareable report stays **public** (R1-a).
  - *Tests (L0)*: gating matrix — `/assess` + `/auditor` signed-in, `/auditor/report/:id` public, `/training` catalog public, `/training` progress/quiz/credential signed-in.
- **A6.** Report export = **PDF only**: remove the `/vpat` route + `src/lib/export/vpat.ts` and any CSV path in `src/lib/export/index.ts`; keep `format=pdf`.

## Phase B — Training (free, no-paywall, sign-in-only progress)

- **B1.** Schema + migration (`path/module/lesson/quiz/learner_progress/credential`) + `training-repository.ts`; `src/db/migrate-training.ts` (no seed — curriculum lives in code).
- **B2.** Content: extract `/learn/*` prose → `src/lib/training-content/*` (concept lessons + authored "apply-it" questions); SC-reference modules templated from `src/lib/standards/*`.
  - *Tests (L1)*: **content-coverage** — every SC renders title/level/manual-test/remediation + templated questions cover all SCs (flag missing SC by number); **content-parity** — extracted prose == source page text.
- **B3.** Services `lib/training/*`: quiz grading (server-side keys), progress (completion≠assessment, "18/24", resume), credential (path-version pin, PDF data).
  - *Tests (L1)*: grading edge cases, denominator math, state transitions, credential idempotency/tamper.
- **B4.** Routes `/training/*` (7) + `api/v1/training/*`; certificate PDF via `certificate-document.tsx` (react-pdf) + `GET /training/certificate/:id/download.pdf`.
  - *Tests (L2)*: progress/quiz/credential handlers with fake repos.

## Phase C — Cleanup, nav, verify

- **C1.** Nav/links: `site-header.tsx` + `site-footer.tsx` (`/learn`→`/training`, `/history`→`/auditor`, add both sections), `resources` link, `sitemap.ts` (drop `/history`/`/learn/*`, add public `/training/*`).
- **C2.** Repoint/rewrite E2E: `history.spec`→`/auditor`, `a11y.spec` (`/learn*`→`/training*`), `report.spec`→`/auditor/report/:id`; add `training.spec`, `auditor.spec`.
- **C3.** Full gate (below).

## Test matrix (runs fail-fast, cheapest first)

| Layer | Command/check | Pinpoints |
|---|---|---|
| 0 | `pnpm check` | unused imports, type drift |
| 0 | reference-integrity (route-map + no-refs-to-removed + nav targets resolve) | broken links, gating drift |
| 0 | import-graph orphan sweep | dead files |
| 1 | `pnpm test` (unit, pure DI) | logic bugs per module |
| 2 | route-handler tests (fake repos) | API behavior |
| 3 | E2E (Playwright) + axe + link crawl | user-facing regressions, a11y |
| 4 | golden-set parity (`tests/differential`) | AI-review engine regression |

**Execution order:** `check` → reference-integrity + orphan sweep → unit → integration → E2E → a11y (all via `cs run` on SWAS).

## Coverage ledger (every file accounted for)

- **Unchanged** — `lib/engine`, `lib/ai-review`, `lib/auth`, `server`, `db` (excl. schema/migrations), `api/**`, `worker`, `lib/standards`, `lib/export` (+ `certificate-document`), `lib/history`, `lib/review`, `components/ui|checkout|legal|auth|api-keys|account|site|cookie-banner|text-size-control|theme-toggle|assessment/*`, marketing/content pages.
- **Moved** — `components/history/*`→`components/auditor/*`; `components/review/review-queue.tsx`→`components/auditor/`; `app/assess/[id]`→`app/auditor/report/[id]`.
- **Removed** — `app/learn/*` (5), `app/history/page.tsx`, `app/review/page.tsx`, `app/assess/[id]/page.tsx`, `app/site/page.tsx` + `components/site/site-scan-client.tsx` (whole-site scan folded into the `/assess` scope toggle); `app/api/v1/assessments/[id]/vpat` + `lib/export/vpat.ts` + CSV path in `lib/export/index.ts` (report is PDF-only).
- **Added** — `app/training/*`, `app/auditor/*`, `api/v1/training/*`, `api/v1/review/bulk-resolve`, `lib/training/*`, `lib/training-content/*`, `lib/auditor/*`, `lib/efficiency/*`, `db/migrate-training.ts`, `db/repository/training-repository.ts`.

## Verification gate (acceptance)

1. `cs run "pnpm check && pnpm test && pnpm build"` green.
2. Orphan sweep: zero unimported `src/` files.
3. Reference-integrity: zero refs to removed routes; nav targets resolve.
4. E2E + axe (100) green on `/training/*`, `/auditor/*`, `/assess`, `/api-keys`.
5. Smoke value chain: `/assess` submit → worker scan → `/auditor/report/:id` + PDF; `/training` lesson → quiz → certificate PDF.
