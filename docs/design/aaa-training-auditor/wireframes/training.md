# Training wireframes (dense)

Density-first for the learner too: progress as fractions + tabular columns, compact
rows, one dominant "Continue" action. Row height 24–28px.

## `/training` — learner dashboard

```
┌─ Training ────────────────────────────────────────────────────┐
│ ┌ Continue learning ────────────────────────────────────────┐ │
│ │ WCAG Foundation · 1.3.3 Sensory Characteristics           │ │
│ │ ▓▓▓▓▓▓▓▓▓▓░░  18/24 · 72% · last 2d ago    [ Continue ▸ ] │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌ Active paths ─────────────────────────────────────────────┐ │
│ │ Path           Done  Score  Next lesson           Action  │ │
│ │ Perceivable    5/9   85%    1.4.3 Contrast        [Resume] │ │
│ │ Operable       2/7   —      2.4.4 Link purpose    [Start]  │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌ Recently completed ────────────┬ Credentials ────────────┐ │
│ │ ✓ Understanding severity · 2d  │ Foundation cert [PDF]   │ │
│ │ ✓ How WCAG works · 5d          │ (verification URL)      │ │
│ └────────────────────────────────┴──────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

Density note: Continue card carries path + lesson + fraction + score + recency in one
row; active paths is a compact table (fraction + score + next lesson + action), not
cards; completed + credentials are two side-by-side compact lists.

## `/training/paths/:id` — path overview

```
┌─ WCAG Foundation · 100% free (incl. certificate) · ~2h ───────┐
│ Coursework 12/12 ✓    Assessment 72% — 80% required            │
│ ┌ Modules ───────────────────────────────────────────────────┐ │
│ │ #  Module        Lessons  Done  Status      Up next        │ │
│ │ 1  Foundations   4        4/4   ✓ completed  —             │ │
│ │ 2  Perceivable   9        5/9   in progress  1.4.3 Contrast│ │
│ │ 3  Operable      7        2/7   not started  2.4.4 Links   │ │
│ │ 4  Understandable 6       0/6   not started  —             │ │
│ │ 5  Robust        3        —     locked       (finish 1-4)  │ │
│ └────────────────────────────────────────────────────────────┘ │
│ [ Continue ▸ ]  (or {Start})                                   │
└────────────────────────────────────────────────────────────────┘
```

Density note: module list is a table (lessons / done / status / up-next in columns);
requirements as two compact lines (completion vs assessment).

## `/training/lessons/:id` — lesson player

```
│ Training › Foundation › 1.1 · How WCAG works        saved ✓   │
│ ┌ content (60%) ───────────────────────┬ module drawer ────┐ │
│ │ How WCAG works                        │ ▸ 1.1 (here)      │ │
│ │ (or SC-ref: 1.4.3 · AA · manual test  │   1.2 ✓           │ │
│ │  · remediation · understanding link)  │   1.3 ✓           │ │
│ │                                       │   1.4 · next      │ │
│ │                                       │   progress 4/9    │ │
│ └───────────────────────────────────────┴───────────────────┘ │
│ [ Complete & continue ▸ ]   n/p advance · ? shortcuts · saved │
└───────────────────────────────────────────────────────────────┘
```

Density note: module drawer shows per-lesson status (✓ / next / current) + module
progress fraction; content and drawer always visible on md+.

## `/training/quizzes/:id` — quiz

```
│ Q 3 of 8 · pass 80% · 3 attempts · ~5 min                     │
│ Which level is 1.4.3 Contrast (Minimum)?                      │
│  (a) A   (b) AA   (c) AAA   (d) AAA+enhanced                  │
│ ✓ Correct — AA. 1.4.6 raises it to AAA.                       │
│  [ Remediation: contrast how-to → ]              [ Next ▸ ]   │
│                                                               │
│ RESULTS  7/10 · 70% · Not passed · 80% req                    │
│   Perceivable 4/5 · Operable 2/3 · Understandable 1/2         │
│   [ Retry missed ]  [ Retake ]                                │
└───────────────────────────────────────────────────────────────┘
```

Density note: one question per screen with progress + pass rule in a header line;
results include a per-topic breakdown; feedback + next action inline.

## `/training/certificate/:id` — certificate

```
│ CERTIFICATE — Ascent Accessibility Foundation                  │
│ awarded to Learner · completed 2026-08-21 · 92% · id CERT-123 │
│ skills: Perceivable · Operable · Understandable · Robust      │
│ [ Download PDF ]  ·  Share (private-by-default)               │
│ verification: /training/certificate/:id (public, DB-backed)   │
└───────────────────────────────────────────────────────────────┘
```
