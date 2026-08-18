# Before vs After — Feature & Performance Comparison

Generated 2026-08-18. Compares the **previous** third-party stack (axe-core + IBM Equal Access + a derived "Lighthouse" score) against the **Ascent Access engine** (clean-room in-house engine + site audit + AI review).

## Executive summary

The new design **fully owns the scanner** and adds two net-new capabilities (AI triage, interaction checks), but has **not yet matched axe-core's rule coverage** — a deliberate, transitional gap. On the fixture used for the earlier comparative report the engine matched axe's detection (83% recall, more SCs mapped); the remaining gap is breadth: axe-core ships ~105 rules across 28 SCs, the engine ~40 checks across 22 SCs.

---

## 1. Rule & SC coverage (measured)

| | axe-core (before) | Ascent Access engine (after) |
|---|---|---|
| Rules | **105** | **38** rules + 2 interaction checks (reflow, keyboard-trap) |
| WCAG SCs machine-tested | **28** | **22** |
| Best-practice rules (no SC) | 32 | 0 |
| SCs both flag | 14 | 14 |
| SCs only this tool | 14 | 6 |

> Correction to earlier statements in this workstream: axe-core 4.13 exposes **~105 rules**, not "400+". The gap is ~3×, not ~10×.

**SCs machine-tested by axe but NOT by the engine (the concrete "missed" list):**

| Level | Missed SCs | What it checks |
|---|---|---|
| A | 1.2.1 | Audio/video-only has a transcript |
| A | 1.4.1 | Colour not the only means of conveying info |
| A | 1.4.2 | Auto-playing audio can be stopped/muted |
| A | 2.2.2 | Moving/blinking/auto-updating content can be paused |
| A | 2.5.3 | Visible label matches the accessible name |
| AA | 1.3.4 | No fixed orientation lock |
| AA | 1.3.5 | Input purpose identifiable (`autocomplete`) |
| AA | 1.4.12 | Text spacing (line-height/letter/word/paragraph) not clipped |
| AA | 3.1.2 | Passages in another language marked with `lang` |
| AAA | 1.4.6, 2.1.3, 2.2.4, 2.4.9, 3.2.5 | Contrast enhanced, keyboard-no-exception, interruptions, link-only purpose, change-on-request |

**SCs the engine maps that axe leaves unmapped** (axe tags them `best-practice`): 1.4.11 non-text contrast, 2.4.3 tabindex, 2.4.6 empty headings, 2.4.7 focus-visible, 2.5.2 pointer cancellation, 2.5.7 dragging.

---

## 2. Feature-by-feature

| Capability | Before | After | Verdict |
|---|---|---|---|
| Accessibility rule engine | axe-core (~105 rules) | In-house clean-room engine (~40 checks) | ⚠️ Gap in breadth |
| WCAG A/AA coverage | 28 SCs | 22 SCs | ⚠️ −6 SCs |
| Best-practice (non-WCAG) checks | 32 (axe) | 0 | ⚠️ Dropped |
| Second-opinion engine | IBM Equal Access (~170 rules, off by default) | — | ⚠️ Dropped |
| Tiered verdicts (violation/potential/recommendation) | IBM | — (pass/fail/incomplete) | ⚠️ Lost nuance |
| Multi-tool corroboration ("confirmed" confidence) | axe+IBM agree | — (all "single-source") | ⚠️ Lost |
| Real Lighthouse (perf/SEO/BP/PWA) | ❌ (derived score only) | ✅ site-audit via browserless | ✅ Gained |
| Performance/SEO/Best-Practices/PWA signals | ❌ | ✅ (appendix) | ✅ Gained |
| Manual-test guidance (57 SCs) | ✅ `sc-manual-tests.ts` | ✅ unchanged | ✅ Parity |
| Element + page screenshot evidence | ✅ (axe/IBM) | ✅ `captureEvidence` | ✅ Parity |
| AI resolution of needs-review | ❌ | ✅ Qwen-VL triage (fail-safe, ≥0.8) | ✅ Net-new |
| Interaction checks (reflow, keyboard trap) | ❌ (not in old flow) | ✅ `interactionScan` | ✅ Net-new |
| Ownership / extensibility | ❌ upstream-controlled, MPL risk | ✅ clean-room, we own every rule | ✅ Core win |

---

## 3. Performance

| Path | Before | After |
|---|---|---|
| Page scan (rules only) | axe ~1–2 s (105 rules) | engine ~sub-second (38 rules) |
| Accessibility "Lighthouse" score | derived, ~0 ms (re-weighted axe IDs) | real site-audit HTTP run, **10–30 s/page** |
| Second opinion | IBM +30–60 s (off by default) | removed |
| Interaction (reflow/keyboard) | n/a | ~2–5 s/page |
| Default per-page cost | **~1–2 s** | **~12–35 s** (site-audit is on by default) |

⚠️ The new default is slower per page **only because real Lighthouse is now on by default** (the old "Lighthouse" score was a free re-weighting of axe IDs, not a real run). If parity of latency matters more than real perf/SEO data, gate `SITE_AUDIT` off or make it opt-in.

---

## 4. What has been missed (the answer)

1. **Rule breadth — the largest gap.** 14 WCAG SCs that axe machine-tests are not yet covered by the engine (9 are A/AA and should be prioritised): 1.2.1, 1.4.1, 1.4.2, 2.2.2, 2.5.3 (A) and 1.3.4, 1.3.5, 1.4.12, 3.1.2 (AA). These are mostly static/computed-style and implementable clean-room.
2. **Best-practice (non-WCAG) rules.** axe's 32 best-practice checks (landmark-one-main, duplicate-id-aria, aria-allowed-role, etc.) were dropped. The engine maps a few to SCs but does not cover the rest.
3. **IBM Equal Access.** Its independent rule set, its `potentialviolation`/`recommendation` tiers, and its corroboration signal (which upgraded findings to "confirmed") are gone. The AI triage partially compensates for judgment, but the machine-level second opinion is not replaced.
4. **Impact-mapping drift.** axe rates `image-alt`, `button-name`, `label` as `critical`; the engine uses `serious`. Same issue → a higher score (critical −10 vs serious −5). This inflates scores relative to the old tool.
5. **Incomplete/cantTell breadth.** axe flags many more "cannot determine" cases (feeding manual review); the engine's `incomplete` is limited to contrast and focus-visible inspection.

## 5. What the new design gained

- **Clean-room ownership** — every rule is ours to extend, correct, and explain; no MPL-2.0 entanglements.
- **Real site audit** — actual performance/SEO/best-practices/PWA data (the old "Lighthouse" score was fabricated from axe IDs).
- **AI-assisted review** — resolves machine-untestable SCs with a hard fail-safe (default `needs-review`, promote only at confidence ≥ 0.8). This raises effective coverage beyond any deterministic engine.
- **Interaction checks** — reflow (1.4.10) and keyboard-trap (2.1.2) driven directly in the browser.

---

## 6. Recommendations (to close the gap)

1. Implement the 9 missing A/AA SCs (order: 2.5.3 label-in-name, 1.4.1 use-of-color, 1.3.5 autocomplete, 1.4.12 text-spacing, 3.1.2 lang-of-parts, 1.3.4 orientation, 2.2.2 pause/stop/hide, 1.4.2 audio control, 1.2.1 transcript).
2. Re-align impact mapping for name/alt/label rules to `critical` to match the old tool's severity (or document the intentional change).
3. Decide whether to reintroduce a second-opinion signal — the cleanest path is the differential harness running axe as a **dev/CI oracle** (already scaffolded in `tests/differential/parity.ts`), not a runtime dependency.
4. Make site-audit latency configurable (already possible via `SITE_AUDIT_TIMEOUT_MS`; consider an off switch if per-page latency is the priority).
