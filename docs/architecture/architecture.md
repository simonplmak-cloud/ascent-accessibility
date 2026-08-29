# Ascent Accessibility — Architecture

> **Status:** current (as-built). This is the authoritative, holistic architecture
> reference for the Ascent Accessibility WebApp. It supersedes any older diagrams
> that still reference third-party scanners (axe-core / IBM / Lighthouse) or a
> Fly.io worker — those have been replaced by the clean-room engine and a
> SWAS-hosted worker.

A web accessibility assessment platform. A visitor submits a domain and a standard
(WCAG 2.2 AA by default); the system crawls the site, runs an in-house accessibility
engine in a headless browser, and returns a conformance verdict, per-success-criterion
results, and evidence-backed findings — exportable as a **PDF-only** report, with
magic-link + Google/GitHub/Microsoft auth, Stripe subscriptions/donations, and a free
training path.

The defining traits of this architecture:

1. **Split, DB-as-queue** deployment — no background work on Vercel.
2. **Clean-room engine** — no third-party accessibility scanners in the scan path.
3. **Stateless auth** — HMAC-signed magic links and sessions; one email → one account.
4. **Machine + AI + human review** — deterministic rules, then BYOK AI, then a
   shrinking human-decision set.

---

## 1. System Context (C4 Level 1)

```mermaid
flowchart TB
  V["Visitor<br/>submits a domain + standard"]
  O["Site owner / auditor<br/>reviews findings, exports PDF, uses API"]
  L["Learner<br/>free training path"]
  APP["Ascent Accessibility WebApp"]
  V -->|"submit domain"| APP
  O -->|"review / download / API"| APP
  L -->|"lessons / quizzes / certificate"| APP
  APP -->|"crawl + scan"| TARGET["Target website"]
  APP -->|"magic-link email"| RESEND["Resend"]
  APP -->|"subscriptions / donations"| STRIPE["Stripe"]
  APP -->|"BYOK AI review"| AI["Anthropic / OpenAI / Gemini"]
  APP -->|"OAuth sign-in"| OAUTH["Google / GitHub / Microsoft"]
```

**Actors**

| Actor | Interaction |
|---|---|
| Visitor | submits a domain, chooses a standard, views the score/report |
| Site owner / auditor | reviews findings, downloads the PDF report, uses the API + API keys |
| Learner | free training path (lessons, quizzes, certificate) |

**External systems:** target websites (crawled/scanned), Resend (transactional email),
Stripe (payments), AI providers (Anthropic / OpenAI / Gemini, BYOK), and the OAuth
identity providers (Google / GitHub / Microsoft).

---

## 2. Container Architecture (C4 Level 2)

```mermaid
flowchart TB
  subgraph Vercel["Vercel — serverless"]
    WEB["Next.js App Router<br/>marketing + API + report pages"]
  end
  subgraph Surreal["SurrealDB Cloud"]
    DB[("SurrealDB<br/>job store + all data")]
  end
  subgraph SWAS["SWAS box — wcag-workforce"]
    W["Worker (systemd)<br/>dist/worker.js"]
    BL["Browserless<br/>headless Chromium (Docker)"]
  end
  WEB -->|"insert queued (DB-as-queue)"| DB
  WEB -->|"read report data"| DB
  W -->|"poll every 1s / claim"| DB
  W -->|"persist findings + score"| DB
  W -->|"CDP ws://127.0.0.1:3000"| BL
  W -->|"crawl (HTTP)"| TARGET["Target website"]
  BL -->|"scan (Chromium)"| TARGET
  WEB -->|"payments"| STRIPE["Stripe"]
  WEB -->|"email"| RESEND["Resend"]
  W -->|"BYOK AI"| AI["AI providers"]
```

| Container | Role | Runtime |
|---|---|---|
| **Vercel** (Next.js App Router) | marketing site + API + report/history/api-keys pages | serverless — **never** crawls/scans |
| **SurrealDB** | job store (the `assessment.status` field *is* the queue) + findings/evidence/report data | SurrealDB Cloud |
| **Worker** | `dist/worker.js` (esbuild bundle) — polls `queued`, runs `runAssessment`, persists results | SWAS box, systemd |
| **Browserless** | headless Chromium for the engine scan, interaction scan, screenshots, and PDF export | Docker, co-located with the worker (`127.0.0.1:3000`) |
| **Stripe** | subscriptions + one-off donations | SaaS |
| **Resend** | magic-link email | SaaS |

The worker connects to Chromium over CDP via `chromium.connectOverCDP`; if
`BROWSERLESS_TOKEN` is unset it falls back to `chromium.launch()` (local dev).

---

## 3. Deployment Topology

```mermaid
flowchart TB
  subgraph Vercel["Vercel — CDN + serverless"]
    WEB["Next.js"]
  end
  subgraph Cloud["SurrealDB Cloud"]
    DB[("SurrealDB")]
  end
  subgraph SWAS["SWAS box — wcag-workforce"]
    subgraph systemd["systemd"]
      W["wcag-score-worker"]
    end
    subgraph Docker["Docker"]
      BL["browserless (Chromium)"]
    end
    W ---|"ws://127.0.0.1:3000"| BL
  end
  WEB --> DB
  W --> DB
  WEB -.->|"HTTPS (same origin)"| SWAS
```

**Why DB-as-queue.** Vercel's serverless functions have no durable runtime, so no
background work runs there. The API endpoint only inserts a `queued` record and returns
`202`; the worker polls SurrealDB and does the heavy lifting. This keeps the scan path
off the request path entirely — a slow site never blocks an HTTP response.

**Worker lifecycle.** systemd keeps `wcag-score-worker` alive; a crash/reboot is
recovered by `recoverStaleRunning` (marks stale `running` records back to `queued`).

---

## 4. Assessment Lifecycle

```mermaid
sequenceDiagram
  participant U as Visitor
  participant API as Vercel API
  participant DB as SurrealDB
  participant W as Worker
  participant BL as Browserless
  participant T as Target site
  U->>API: POST /api/v1/assessments
  API->>API: Zod validate + SSRF check
  API->>DB: INSERT assessment (status=queued)
  API-->>U: 202 Accepted
  loop poll every 1s
    W->>DB: claim next queued
  end
  W->>DB: UPDATE status=running
  W->>T: crawl (sitemap → links, HTTP)
  W->>BL: launch/acquire browser + inject engine
  BL->>T: goto + scan each page (engine + interaction)
  W->>DB: persist findings + evidence + score
  W->>BL: render PDF report
  W->>DB: finalize (status=completed)
  U->>API: GET report
```

**Status state machine** (`assessment.status` *is* the queue):

```mermaid
stateDiagram-v2
  [*] --> queued: POST /api/v1/assessments
  queued --> running: worker claims
  running --> completed: finalize() success
  running --> failed: error caught
  running --> queued: recoverStaleRunning (stale)
  completed --> [*]
  failed --> [*]
```

---

## 5. How a website is assessed (deep dive)

This is the authoritative walk-through of the assessment mechanics — from the
submitted URL to the persisted conformance result. The sections that follow
(6–9) expand on the individual stages at the module level.

### 5.1 Crawl & page discovery

```mermaid
flowchart TB
  SEED["seed URL"] --> ROBOTS["robots.txt<br/>parse disallow rules"]
  ROBOTS --> SITEMAP{"sitemap.xml?"}
  SITEMAP -->|"found (or sitemap index)"| SLOC["collect <loc> URLs<br/>(sitemapindex recurse ≤ 3)"]
  SITEMAP -->|"not found"| LINK["link crawl<br/>extractLinks from HTML"]
  SLOC --> BFS["same-origin BFS<br/>depth ≤ maxDepth, cap maxPages"]
  LINK --> BFS
  BFS --> OUT["urls[] + pagesScanned + partial + sitemapUrls"]
```

- **robots.txt** first (`parseRobotsDisallow`); every URL is filtered by
  `isAllowedByRobots`.
- **sitemap.xml** (`fetchSitemapUrls`) — handles `<sitemapindex>` (recursive, max
  depth 3) and `<loc>` entries. If any are found they seed the queue; otherwise the
  crawler falls back to link extraction (`extractLinks`).
- Bounded BFS: `maxDepth` (default 3), `maxPages` (default 100), same-origin only,
  a `visited` set, and a politeness delay (default `CRAWL_DELAY_MS ?? 200`).
- **Depth 0** = single-page scan — the crawl is skipped entirely.

### 5.2 Per-page engine evaluation

For every page, the worker acquires a pooled browser context, injects the
self-contained engine, navigates, and evaluates it in-page:

```mermaid
flowchart TB
  G["goto(url)<br/>waitUntil domcontentloaded"] --> S["settle (SCAN_SETTLE_MS)"]
  S --> E["evaluate(() => __apfEngine.run(tags))"]
  E --> LOOP{"for each rule<br/>with a matching tag"}
  LOOP --> M["matcher → querySelectorAll<br/>(or [documentElement] if null)"]
  M --> Z{"nodes?"}
  Z -->|"none"| IN["inapplicable"]
  Z -->|"some"| X["for each node:<br/>extract facts"]
  X --> C["run checks (pure)"]
  C --> V{"any fail?"}
  V -->|"yes"| F["violation + node html / failureSummary"]
  V -->|"incomplete"| I["incomplete"]
  V -->|"all pass"| P["pass"]
  F & I & P & IN --> R["{ violations, passes, incomplete,<br/>inapplicable, features, mediaUrls }"]
```

The in-page `run(tags)` loop, in full:

1. Build a `tagSet` from the selected standard's tags.
2. Skip any rule whose `tags` don't intersect the set.
3. `matcher` selects candidate nodes (or the whole document when `matcher` is null,
   for document-level rules such as `<html lang>`).
4. No matching nodes → the rule is recorded **inapplicable**.
5. For each node, `extract` pulls facts (a pure DOM snapshot); each `check` runs
   against those facts. The first failing check produces a **violation** node (with
   its `failureSummary` and a truncated outerHTML slice); otherwise **incomplete**
   nodes are collected.
6. Results are bounded: `MAX_NODES` (100) per violation, `MAX_BUCKET` (1000) per
   category.

### 5.3 Rule anatomy

Every rule is `matcher → extract (facts) → checks`. Concrete example (`image-alt`,
mapping to SC 1.1.1):

```ts
{
  id: "image-alt",
  impact: "critical",
  tags: ["wcag2a", "wcag111"],
  wcagSc: ["1.1.1"],
  matcher: "img",
  extract: (el) => ({ alt: el.getAttribute("alt"), role: el.getAttribute("role") }),
  checks: [{
    id: "alt-present-or-decorative",
    evaluate: (f) => {
      if (f.alt !== null) return { result: "pass" };
      if (f.role === "presentation" || f.role === "none") return { result: "pass" };
      return { result: "fail", failureSummary: "img element has no alt attribute" };
    },
  }],
}
```

The 55 rules are split across `perceivable` (14), `robust` (9), `additional` (9),
`gap-fill` (8), `operable` (5), `rendering` (4), `interaction` (3), `understandable`
(3). Every rule carries `wcagSc` — the success criteria it can fail.

### 5.4 Feature detection & applicability

Alongside rule results, the engine reports **page features** — 25 booleans extracted
from the DOM (`__apfFeatures`): `hasVideo`, `hasAudio`, `hasForms`, `hasTables`,
`hasIframes`, `hasImages`, `hasHeadings`, `hasLandmarks`, `hasLang`,
`hasPositiveTabindex`, `hasAnimatedContent`, `hasLiveContent`, and more.

```mermaid
flowchart LR
  DOM["DOM"] --> F["__apfFeatures(document)"]
  F --> APP["isScApplicable(sc, matchedScs, features)"]
  APP -->|"not-applicable"| NP["NotPresent"]
  APP -->|"applicable"| EVAL["evaluate / AI review"]
```

Features are merged across pages (`mergeFeatures`) and drive **success-criterion
applicability**: an SC that isn't applicable (e.g. captions when there is no video)
is marked `NotPresent`, not `Failed`. The page language is also detected
(`detectPageLanguage`) and persisted for the report.

### 5.5 Interaction scan

Two checks run outside the pure rule engine because they need real browser behaviour:

- **Reflow (1.4.10)** — the viewport is resized to 320px; horizontal overflow
  (`scrollWidth > innerWidth + 1`) is flagged.
- **Keyboard trap (2.1.2)** — Tab is pressed up to 20 times, tracking the *distinct*
  elements focus lands on; a page with many focusable elements but only one distinct
  target is flagged as a trap.

### 5.6 Evidence capture

For each page the scanner captures a full-page screenshot (with violations
highlighted) and element screenshots for the top findings; images are optimized
(`optimizeEvidenceImage`) and stored as bytes in `evidence`, with page snapshots
(screenshot + HTML) referenced from the assessment.

### 5.7 Findings consolidation

```mermaid
flowchart LR
  V["violations per page"] --> F["violationsToFindings"]
  F --> G["group by (primary SC | rule) + pageUrl"]
  G --> O["Finding: ruleId, impact, instances[],<br/>wcagSc, recommendation, sources"]
```

Each engine violation becomes a `Finding` with its node instances; findings are
grouped by primary success criterion (or rule) + page. Impact is the rule's severity
(`critical` / `serious` / `moderate` / `minor`); a recommendation is attached
(`getRecommendation`); provenance is `sources: [{ tool: "engine" }]`.

### 5.8 AI review (unresolved SCs)

SCs the deterministic engine left `Unresolved` go through AI review:

```mermaid
flowchart LR
  U["Unresolved SCs"] --> T["runTriage<br/>build prompts (screenshot + context)"]
  T --> V["vision-model verdict per SC"]
  V -->|"confidence ≥ 0.8"| R["Passed / Failed"]
  V -->|"otherwise"| CT["CannotTell"]
  R --> A["applyAiVerdicts<br/>Failed → new findings"]
  A -->|"media SCs"| AU["audio-model pass"]
```

`runTriage` builds per-SC prompts (screenshot + context), the BYOK vision model
returns a verdict with a confidence score, and only confident verdicts (≥ 0.8) fold
in; otherwise the SC stays `CannotTell`. A second **audio pass** resolves media SCs.
Budget is tracked per scan (calls + images).

### 5.9 Scoring & conformance (folding)

```mermaid
flowchart TB
  F1["findings"] --> M["computeConformance<br/>machine verdict per SC"]
  M --> U{"Unresolved?"}
  U -->|"no"| FIN["final = machine"]
  U -->|"yes"| AI["AI (vision + audio)"]
  AI --> FIN2["final = AI (Passed / Failed)<br/>or CannotTell"]
  FIN & FIN2 --> O["finalizeConformance"]
  O --> OUT["outcome + levelAttained + coverage"]
```

Machine verdicts (`Passed` / `Failed` / `NotPresent` / `Unresolved`) are computed
from findings' `wcagSc` tags, applicability, and the passed-rule set; AI verdicts
resolve `Unresolved` rows; `finalizeConformance` produces the final per-SC table, the
`levelAttained` (A/AA/AAA), the `coverage`, and the conformance `outcome`
(`conforms` / `does-not-conform` / `undetermined`).

### 5.10 Site audit (perf / SEO)

After the accessibility scan, a **site audit** queries Browserless `/performance` for
perf/SEO signals, appended to the report as a non-scored appendix.

---

## 6. Scan Pipeline

```mermaid
flowchart TB
  A["crawl<br/>sitemap-first → link crawl (robots.txt)"] --> B["per-page scan"]
  B --> B1["engine scan<br/>55 rules via page.evaluate"] & B2["interaction scan<br/>keyboard / gesture"]
  B1 & B2 --> C["evidence capture<br/>full-page + element screenshots"]
  C --> D["AI review (BYOK)<br/>resolve Unresolved SCs"]
  D --> E["scoring<br/>machine → AI → final verdict"]
  E --> F["consolidate findings<br/>map to success criteria"]
  F --> G["persist<br/>finalize() — single UPDATE"]
  G --> H["render PDF report"]
  H --> I["site audit<br/>perf / SEO signals"]
```

1. **Crawl** — sitemap-first, then link crawl, respecting `robots.txt`. Depth-0
   (single-page) scans skip the crawl entirely.
2. **Scan** — the engine (55 rules) + an interaction scan (keyboard traversal, focus
   order) per page.
3. **Evidence** — one full-page screenshot with violations highlighted + element
   screenshots for the top findings (stored as bytes in `evidence`).
4. **AI review** — BYOK models resolve SCs the deterministic engine left `Unresolved`.
5. **Scoring** — machine verdicts folded with AI verdicts into final per-SC verdicts
   and a conformance outcome.
6. **Consolidate** — findings mapped to WCAG success criteria.
7. **Persist** — one `finalize()` UPDATE (findings + comparison + pages + snapshots +
   score) rather than many writes.
8. **PDF** — render and store the report.
9. **Site audit** — a perf/SEO appendix (via Browserless `/performance`).

**Resilience:** each page is wrapped in `WORKER_PAGE_TIMEOUT_MS` (default 180s); a
pathological page is skipped and the browser recreated so one bad page never blocks
the queue.

---

## 7. Engine Architecture (clean-room)

The engine is **clean-room in-house** — there are no third-party accessibility engines
(axe-core, IBM, Lighthouse) anywhere in the scan path.

### Rule model

```mermaid
flowchart LR
  R["Rule"] --> M["matcher<br/>CSS selector (which elements)"]
  R --> X["extract<br/>pull facts from the DOM"]
  R --> C["checks<br/>pure assertions over facts"]
  M --> X --> C
```

Every rule is a triple:

- **`matcher`** — a CSS selector that picks candidate elements.
- **`extract`** — a function that reads facts from a matched element (a pure snapshot
  of the DOM, never live).
- **`checks`** — atomic, pure assertions over the extracted facts → `pass` / `fail` /
  `incomplete`.

Because `extract` only uses browser globals and `checks` are pure, the whole engine can
be serialized and injected into the page.

### Injection + execution

```mermaid
sequenceDiagram
  participant W as Worker
  participant P as Page (Chromium)
  participant E as __apfEngine (injected)
  W->>P: addInitScript(buildEngineSource(ALL_RULES))
  W->>P: goto(target URL)
  W->>P: evaluate(() => __apfEngine.run(tags))
  P->>E: run(tags)
  E->>E: for each rule: matcher → extract → checks
  E-->>P: violations / passes / incomplete + features + mediaUrls
  P-->>W: RawScanResult
```

- `buildEngineSource` inlines each rule via `.toString()` into a self-contained script.
- The script is injected with **`page.addInitScript`** (runs at CDP level, so the
  target site's CSP cannot block it — `addScriptTag` would be).
- `page.evaluate` calls `__apfEngine.run(tags)` in-page and returns a raw result that
  is mapped to violations/passes/incomplete plus page features and media URLs.

### Rule inventory (55 rules)

| Category | Count | Notes |
|---|---|---|
| perceivable | 14 | colour/contrast, text alternatives, media |
| robust | 9 | parsing, name/role/value, status |
| additional | 9 | supplemental checks |
| gap-fill | 8 | fills SCs the base set doesn't cover |
| operable | 5 | keyboard, focus, navigation |
| rendering | 4 | layout / visibility |
| interaction | 3 | keyboard traversal, gestures |
| understandable | 3 | language, headings, labels |
| **Total** | **55** | |

Full rule documentation lives in `docs/engine/` (one entry per rule).

### Standards catalog

```mermaid
flowchart LR
  STD["STANDARDS<br/>wcag21a / wcag21aa / wcag22a / wcag22aa / wcag22aaa"] --> TAGS["cumulative tag set"]
  TAGS --> SEL["selectRules(tags)"]
  SEL --> ENGINE["injected engine"]
```

Rules are tagged by the WCAG version they were introduced in (non-cumulative). Selecting
a standard therefore composes the full cumulative tag set across versions; `wcag22aa`
(the default) carries the 2.0/2.1/2.2 AA additions.

---

## 8. Scoring & Conformance Model

```mermaid
flowchart LR
  F["findings (wcagSc tags)"] --> M["machine verdict per SC"]
  M --> V{"Unresolved?"}
  V -->|no| FV["final = machine"]
  V -->|yes| AI["AI verdict"]
  AI -->|"confidence ≥ 0.8"| FV2["final = AI (Passed/Failed)"]
  AI -->|else| FV3["final = CannotTell"]
  FV & FV2 & FV3 --> O["conformance outcome"]
  O -->|"any CannotTell"| U["undetermined"]
  O -->|"any Failed"| DC["does-not-conform"]
  O -->|"otherwise"| C["conforms"]
```

- **Machine verdict** per SC: `Passed` · `Failed` · `NotPresent` · `Unresolved`.
- **AI verdict** folds in only `Unresolved` SCs (confidence threshold 0.8).
- **Final verdict** (W3C/WAI vocabulary): `Passed` · `Failed` · `CannotTell` · `NotPresent`.
- **Conformance outcome**: `undetermined` (any `CannotTell`) → `does-not-conform`
  (any `Failed`) → `conforms`.
- **Level attained**: `A` / `AA` / `AAA` (highest level with no `Failed`/`CannotTell`).
- **Coverage**: `tested / total` (tested = passed + failed).
- **Finding impact** (severity): `critical` · `serious` · `moderate` · `minor`.

> The severity-weighted 0–100 score was replaced by this conformance model
> (outcome + coverage + level attained + per-SC table).

---

## 9. AI Review & Human Review

```mermaid
sequenceDiagram
  participant E as Engine
  participant A as AI review (BYOK)
  participant H as Human review
  E->>A: Unresolved SCs
  A->>A: triage + vision/audio model verdicts
  A-->>E: Passed / Failed (or CannotTell)
  A->>H: residual SCs (HUMAN_DECISION_SCS)
  H->>H: reviewer answers decision point
  H-->>E: final verdict (source: human)
```

- **AI review** is **BYOK** (bring-your-own-key): Anthropic / OpenAI / Gemini, with
  vision + audio models, a per-scan budget/balance, and a confidence threshold of 0.8.
- **Human review** is the residual set the AI *cannot* decide — captured by a
  six-category decision-point contract in `human-decision.ts`:

| Category | `whyNotAi` (why a machine can't decide — yet) |
|---|---|
| interaction | synthetic events can't reproduce real keyboard/gesture/AT input |
| temporal | a static snapshot can't sit through a session or measure flash frequency |
| dynamic-state | transient UI state the snapshot can't observe |
| multipage | cross-page consistency (nav, labels) |
| editorial | wording, semantics, meaning |
| domain | subject-matter judgement |

Each category carries a `pathToAi` (the future enhancement that moves it into AI
review). `HUMAN_DECISION_SCS` is a *snapshot expected to shrink over time* — the
"no permanently human" principle. Findings carry `source` provenance (`ai` / `human`).

---

## 10. Data Model (SurrealDB)

```mermaid
erDiagram
  user ||--o{ user_email : "emails"
  user ||--o{ user_oauth_link : "linked identities"
  user ||--o{ assessment : "owns"
  user ||--o{ subscription : "subscribes"
  user ||--o{ api_key : "keys"
  user ||--o{ ai_sc_config : "AI review config"
  user ||--o{ learner_progress : "training"
  user ||--o{ credential : "earns"
  assessment ||--o{ evidence : "captures"
  assessment ||--o{ report_pdf : "renders"
  assessment ||--o{ audit_log : "logs"
  subscription ||--o{ stripe_topup : "top-ups"
```

| Table | Purpose |
|---|---|
| `assessment` | the job record — `status` is the queue |
| `evidence` | screenshots + element snapshots (bytes) |
| `report_pdf` | rendered PDF bytes |
| `metrics` | storage/queue/failure counters |
| `user` | account identity |
| `user_email` | email compartment (canonical key) |
| `user_oauth_link` | `(provider, subject)` → user |
| `subscription` / `stripe_topup` | Stripe state |
| `api_key` | API credentials |
| `audit_log` | API-key audit trail |
| `rate_limit` | per-IP/route rate limiting |
| `ai_sc_config` | per-SC AI review configuration |
| `learner_progress` / `credential` | training |

**SurrealDB gotchas** (encode in any code touching this layer):

- Record-ID lookups need a cast: `WHERE id = type::record($id)`.
- `ORDER BY x` requires `x` in the projection.
- `SCHEMAFULL` can't bind arrays of objects — `findings`, `log`, `comparison` are
  stored as JSON strings (`JSON.stringify` / `JSON.parse`).
- `SCHEMAFULL` re-validates the whole record on any UPDATE — change a type via
  `DEFINE FIELD OVERWRITE` (a migration), not a plain write.

---

## 11. Auth & Identity

```mermaid
sequenceDiagram
  participant U as User
  participant W as WebApp (Vercel)
  participant DB as SurrealDB
  participant P as Provider
  alt magic-link (stateless)
    U->>W: POST /api/auth/magic-link (email)
    W->>W: issueMagicLinkToken (HMAC, 15 min, no DB write)
    W-->>U: email with link (Resend)
    U->>W: GET /api/auth/magic-link/callback?token
    W->>W: verifyMagicLinkToken
    W->>DB: resolveUserByEmail (verified)
    W-->>U: Set-Cookie wcag_session
  else OAuth (authorization-code)
    U->>W: GET /api/auth/oauth/{provider}
    W-->>U: 307 → provider authorize (signed state)
    U->>P: consent
    P-->>W: /callback?code&state
    W->>W: verifyOauthState + exchange code
    W->>DB: linkOrCreateOAuth
    W-->>U: Set-Cookie wcag_session
  end
```

- **Magic link** — stateless: an HMAC-signed token (15-min TTL), no DB write until the
  email is verified by clicking the link.
- **OAuth** — authorization-code flow for Google / GitHub / Microsoft (no client-side
  tokens; Google JWKS is verified locally).
- **Session** — an HMAC-JWT (`wcag_session`, httpOnly, 24h).
- **One email → one account** — `normalizeEmail` (trim + lowercase) is the canonical
  compartment key; `linkOrCreateOAuth` resolves `(provider, subject) → email → account`,
  and `EmailConflictError` guards against unverified-email hijacking.

Auth is SurrealDB-native (not Clerk). Every assessment needs a non-null `ownerId`.

---

## 12. API Surface

| Group | Routes | Notes |
|---|---|---|
| Assessments | `/api/v1/assessments` (+ `/{id}`, `/export`, `/vpat`, `/badge.svg`, `/stream`, `/evidence/{evidenceId}`, `/review`) | Zod-validated; `POST` inserts `queued` → `202` |
| Review | `/api/v1/review/queue`, `/{id}`, `/{id}/claim`, `/{id}/submit`, `/bulk-resolve` | human-review queue |
| Findings | `/api/v1/findings`, `/suggest-fix` | AI remediation suggestions |
| Account | `/api/account`, `/ai-key`, `/ai-provision`, `/ai-topup`, `/models`, `/api/v1/account/usage` | BYOK + usage |
| API keys | `/api/v1/api-keys`, `/{id}` | key lifecycle |
| Training | `/api/v1/training/lessons`, `/quizzes`, `/progress`, `/credential` | free path |
| Auth | `/api/auth/magic-link`, `/oauth/{provider}`, `/session`, `/sign-out` | stateless + OAuth |
| Webhooks | `/api/webhooks/stripe` | Stripe events |
| Health | `/api/v1/health` | liveness |

Cross-cutting: Zod validation everywhere, SSRF guard on the submitted URL, and
rate limiting.

---

## 13. Internationalization

```mermaid
flowchart LR
  REQ["request"] --> MID["next-intl"]
  MID --> LOC["/[locale] segment<br/>en · zh-Hans · zh-Hant"]
  LOC --> MSG["messages/{locale}.json"]
```

`next-intl` with `[locale]` route segments and three locales (`en`, `zh-Hans`,
`zh-Hant`). Navigation is centralized in `src/lib/site/navigation.ts`.

---

## 14. Payments

Stripe handles **subscriptions** and **one-off donations**; the webhook
(`/api/webhooks/stripe`) syncs `subscription` / `stripe_topup` records. BYOK AI
consumption is metered against a per-user balance with top-ups.

---

## 15. Training (free path)

A self-contained training path — lessons, paths, quizzes — tracking progress in
`learner_progress` and issuing `credential` records (downloadable certificate).
Lesson checks are graded server-side (`/api/v1/training/lessons/[id]/check`).

---

## 16. Observability & Security

**Observability:** pino-structured JSON logging (`src/lib/observability/logger`) +
lightweight metrics (`src/lib/observability/metrics`) persisted to the `metrics`
table. Sentry was removed (FSL dependency).

**Security:**

- SSRF guard on the submitted URL before any outbound fetch.
- Rate limiting (`rate_limit` table).
- BYOK API keys encrypted at rest.
- Secrets: repo-level push protection + secret scanning enabled.
- No secrets committed; `.env*`, hostnames, and instance IDs are gitignored.

---

## 17. Deployment & Operations

```mermaid
flowchart LR
  PUSH["push to main"] --> CI["GitHub Actions CI<br/>check / lint / test / build"]
  PUSH --> V["Vercel auto-deploy"]
  WORKER["worker deploy"] --> DEP["deploy/swas/deploy.sh<br/>git pull → install → worker:build → systemctl restart"]
  MIG["schema change"] --> RUN["run-once migration<br/>tsx src/db/migrate-*.ts"]
```

- **Vercel** auto-deploys on push to `main`.
- **Worker** — `deploy/swas/deploy.sh` on the SWAS box: `git pull`, `pnpm install
  --frozen-lockfile`, `pnpm worker:build` (esbuild → `dist/worker.js`), `systemctl
  restart wcag-score-worker`.
- **Migrations** — standalone, idempotent, run-once scripts (run from the worker box);
  `pnpm db:migrate` is avoided in prod (fails on "already exists").
- **CI** — GitHub Actions runs `pnpm check`, `lint`, `test`, `build` on push/PR.
- **Worker build** must use `--packages=external`; production runs `node dist/worker.js`
  (not `tsx`, which hangs in Docker).

---

## 18. Architectural Decisions

| ADR | Decision |
|---|---|
| `docs/architecture/adr/001-db-as-queue.md` | SurrealDB `assessment.status` is the queue; no background work on Vercel |
| `docs/architecture/adr/002-axe-addinitscript.md` | engine injected via `addInitScript` (CDP-level, CSP-immune) |
| `docs/architecture/adr/003-tool-consolidation.md` | replace third-party scanners with the clean-room engine |

---

## 19. Evolution & Scaling Roadmap (2-year horizon)

Forward-looking, not yet built:

```mermaid
flowchart LR
  NOW["today"] --> A["engine coverage ↑<br/>55 → more SCs automated"]
  NOW --> B["human-decision set ↓<br/>AI review automation"]
  NOW --> C["worker horizontal scale<br/>sharded queue / multiple workers"]
  NOW --> D["multi-region<br/>worker + DB close to targets"]
  A & B & C & D --> E["more SCs fully machine/AT-resolved,<br/>less human review, higher throughput"]
```

| Axis | Today | 2-year direction |
|---|---|---|
| Engine coverage | 55 rules | grow rule set toward full WCAG 2.2 automated coverage |
| Human review | 6 residual categories | shrink `HUMAN_DECISION_SCS` via the `pathToAi` enhancements (real keyboard/AT automation, session simulation, flash analysis) |
| Worker scaling | single SWAS box, pooled browsers | horizontal workers with a sharded queue + queue-depth autoscaling |
| Deployment regions | one SWAS region | co-locate worker/DB near target regions to cut crawl latency |
| Storage | 180-day retention + evidence compaction | tiered storage, tighter retention/compaction policy |

---

## Key module map

| Module | Responsibility |
|---|---|
| `src/lib/assessment` | orchestration (crawl → scan → consolidate → score → persist), DI-friendly |
| `src/lib/crawler` | sitemap + link crawl (`robots.txt`) |
| `src/lib/engine` | clean-room engine: rule registry, runner, interaction scan |
| `src/lib/evidence` | screenshot capture + `evidence` store |
| `src/lib/ai-review` | BYOK AI: providers, triage, budget, prompts |
| `src/lib/comparison` | findings consolidation + site audit (perf/SEO) |
| `src/lib/scoring` | machine → AI → final verdicts + conformance |
| `src/lib/standards` | WCAG SC catalog, applicability, remediation, human-decision contract |
| `src/lib/auth` | magic-link, OAuth, session, identity resolution |
| `src/lib/export` | PDF (report-document.tsx) + ACR + badge |
| `src/db` / `src/db/repository` | schema + repositories (assessment, evidence, api_key, …) |
| `src/server` | server-only adapters: scanner-factory, byok, stripe, rate-limit, ssrf |
| `src/worker` | the worker entrypoint (esbuild → `dist/worker.js`) |
