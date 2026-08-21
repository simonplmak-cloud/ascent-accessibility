# 03 — Training pages (page-by-page)

Content model: **curriculum in code** (`src/lib/training-content/*`), **progress +
credentials in DB**. Concept lessons = authored prose (extracted from the old
`/learn/*`, `/methodology`, `/validation`, `/human-review` pages) + authored "apply-it"
quiz questions. SC-reference modules = templated from `src/lib/standards/*`.

**Density** (see 01 + wireframes): paths/modules are compact tables (fraction + score
+ next lesson + action in columns); the Continue card carries path/lesson/fraction/
score/recency in one row; progress is always a fraction, never a bare bar.

## `/training` — Learner dashboard

- **Continue learning** card (dominant, `role="region"` + h2): path name, current
  lesson, "Last active …", progress fraction, single Continue button → exact lesson.
- Active paths list: title, fraction (`18/24`), current module, next lesson, estimate.
- Recently completed · Credentials (verification URL + PDF download).
- States: signed-out → show catalog + "Sign in to save progress"; empty (no progress).
- `aria-live="polite"` for resume/progress updates.

## `/training/paths` — catalog

- Cards: title, outcome, duration, "100% free — including certificate", module count.
- No enrollment; opening a path is free.

## `/training/paths/:id` — path overview

- Header: title, outcome, audience/prereqs, total duration, free badge.
- Requirements: "Coursework 12/12 · Assessment 72% (80% required)" as two lines.
- Module list (collapsible): each row = status (not started / in progress / completed /
  needs_retry), activity count, type icons (lesson/quiz).
- Primary: Start / Continue.

## `/training/paths/:id/modules/:mid` — module

- Breadcrumb (path → module). Lesson list with per-lesson status + "Up next" highlight.

## `/training/lessons/:id` — lesson player

- Breadcrumb; title; content (markdown body, or SC-reference template rendering
  `getSc`/`getManualTest`/`getScRemediation` + `understandingUrl`).
- Saved-state indicator ("Saved" via aria-live).
- Primary action: **Complete & continue** (or Next lesson on completion).
- Keyboard: `n`/`j`/`→` advance, `p`/`k`/`←` back; `?` shortcuts. Focus-visible, no trap.

## `/training/quizzes/:id` — quiz

- **Start card**: question count, estimated time, pass threshold, attempts policy,
  "hints affect scoring?" — before starting.
- One question per screen: "Q 3 of 8"; large answer targets; keyboard; no surprise timer.
- On submit → immediate feedback: correct/incorrect + correct answer + why + remediation
  link to the SC. Preserve the learner's answer on validation failure.
- Results: `7/10 · 70% · Not yet passed · 80% required` + topic breakdown +
  **Retry missed questions** + **Retake** (best score preserved).

## `/training/certificate/:id` (+ `download.pdf`)

- HTML page: learner name, path/version, completion date, score, credential id,
  skills/outcomes, **Download PDF**, share (private-by-default).
- PDF via `certificate-document.tsx` (react-pdf), reusing `src/lib/export` conventions.
- Verification: public URL, DB-backed record (id → credential), tamper-evident (server-
  held, not client-signed).

## States everywhere

Empty (no progress) · loading (aria-busy) · error (role=alert + focus) · success
(role=status). Never color-only status.
