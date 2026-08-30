# Before vs After — Feature & Performance Comparison

Generated 2026-08-18; **refreshed 2026-08-30**. Compares the **previous**
third-party stack (axe-core + IBM Equal Access + a derived "Lighthouse" score)
against the **Ascent Accessibility engine** (clean-room in-house engine + site
audit + AI review).

## Executive summary

The new design **fully owns the scanner** and adds net-new capabilities (AI
triage, interaction checks). The engine has grown from 38 to **58 deterministic
rules** across **43 machine-tested WCAG SCs** (plus site-audit + AI/human
escalation), closing the A/AA rule-breadth gap against axe-core. Remaining gaps
are deliberate: best-practice (non-WCAG) checks and a second-opinion engine.

---

## 1. Rule & SC coverage (current)

| | axe-core (before) | Ascent Accessibility engine (current) |
|---|---|---|
| Rules | **105** | **58** rules + 2 interaction checks (reflow, keyboard-trap) |
| WCAG SCs machine-tested | **28** | **43** |
| Best-practice rules (no SC) | 32 | 0 |
| Section 508 | n/a | **maps to WCAG 2.0 A + AA** (2017 refresh reference) |

> The engine's 43 machine SCs are derived from the actual rule set (`wcagSc`
> per rule) plus the two interaction-scan SCs (1.4.10, 2.1.2).

**A/AA SCs that axe machine-tests but the engine does not:** none. The nine
previously-missed A/AA SCs are now implemented clean-room:

| SC | Level | Rule |
|---|---|---|
| 1.2.1 | A | `media-transcript` |
| 1.4.1 | A | `use-of-color` |
| 1.4.2 | A | `no-autoplay-audio` |
| 2.2.2 | A | `pause-stop-hide` |
| 2.5.3 | A | `label-in-name` |
| 1.3.4 | AA | `orientation` |
| 1.3.5 | AA | `autocomplete-valid` |
| 1.4.12 | AA | `text-spacing` |
| 3.1.2 | AA | `lang-of-parts` |

WCAG 2.2 additions now machine-tested (2026-08-30): **2.4.11** Focus Not
Obscured (`focus-not-obscured`), **3.3.8** Accessible Authentication
(`accessible-authentication`), **3.2.6** Consistent Help (`consistent-help`).
These are presence-based/conservative: pass on a clear signal or absence of the
trigger, `incomplete` (→ Cannot tell / AI / human) otherwise.

---

## 2. Feature-by-feature

| Capability | Before | After | Verdict |
|---|---|---|---|
| Accessibility rule engine | axe-core (~105 rules) | In-house clean-room engine (58 rules) | ✅ Parity on A/AA SC breadth |
| WCAG A/AA coverage | 28 SCs | 43 SCs | ✅ +15 SCs |
| Section 508 | n/a | ✅ WCAG 2.0 A/AA mapping | ✅ Gained |
| Best-practice (non-WCAG) checks | 32 (axe) | 0 | ⚠️ Dropped (not-now) |
| Second-opinion engine | IBM Equal Access (~170 rules) | — (axe as dev/CI differential oracle) | ⚠️ Dropped |
| Tiered verdicts (violation/potential/recommendation) | IBM | pass/fail/incomplete | ⚠️ Lost nuance |
| Multi-tool corroboration | axe+IBM agree | — | ⚠️ Lost |
| Real Lighthouse (perf/SEO/BP/PWA) | ❌ (derived score) | ✅ site-audit via browserless | ✅ Gained |
| Manual-test guidance | ✅ `sc-manual-tests.ts` | ✅ unchanged | ✅ Parity |
| Element + page screenshot evidence | ✅ | ✅ `captureEvidence` | ✅ Parity |
| AI resolution of needs-review | ❌ | ✅ vision/audio triage (fail-safe ≥0.8) | ✅ Net-new |
| Interaction checks (reflow, keyboard trap) | ❌ | ✅ `interactionScan` | ✅ Net-new |
| Ownership / extensibility | ❌ upstream-controlled | ✅ clean-room | ✅ Core win |

---

## 3. Performance

| Path | Before | After |
|---|---|---|
| Page scan (rules only) | axe ~1–2 s | engine ~sub-second |
| Site-audit (perf/SEO/BP/PWA) | derived ~0 ms | real run **10–30 s/page** (on by default) |
| Second opinion | IBM +30–60 s | removed |
| Interaction (reflow/keyboard) | n/a | ~2–5 s/page |
| Default per-page cost | ~1–2 s | ~12–35 s (site-audit on by default) |

Site-audit latency is configurable via `SITE_AUDIT_TIMEOUT_MS`; disable/opt-in if
per-page latency is the priority.

---

## 4. What has been missed (the answer, current)

1. **Best-practice (non-WCAG) rules.** axe's 32 best-practice checks
   (landmark-one-main, duplicate-id-aria, aria-allowed-role, …) are not covered.
   The engine maps a few to SCs but has no non-WCAG rule set.
2. **Second-opinion / corroboration signal.** IBM Equal Access is gone; the
   differential harness (`tests/differential/parity.ts`) runs axe only as a
   dev/CI oracle, not a runtime second opinion. AI triage partially compensates
   for judgement but does not replace a machine-level second opinion.
3. **AAA-only SCs.** 2.4.12/2.4.13 (Focus Not Obscured Enhanced / Focus
   Appearance) remain AI/vision or human; 2.1.3, 2.2.4, 2.2.5, 2.3.2, 2.5.1,
   2.5.4, 2.5.6, 3.1.6, 3.2.3–3.2.5, 3.3.4, 3.3.6, 3.3.9 remain manual.
4. **Incomplete/cantTell breadth.** The engine's `incomplete` set is conservative
   (contrast, focus-visible, and the presence-based SCs); axe flags more
   "cannot determine" cases. Acceptable given the AI/human escalation path.

Resolved since the original report: impact mapping is now aligned (image-alt,
button-name, label are `critical`, matching axe); Section 508 is functional.

---

## 5. What the new design gained

- **Clean-room ownership** — every rule is ours to extend, correct, and explain.
- **Real site audit** — actual performance/SEO/best-practices/PWA data.
- **AI-assisted review** — resolves machine-untestable SCs with a hard fail-safe
  (default `needs-review`, promote only at confidence ≥ 0.8).
- **Interaction checks** — reflow (1.4.10) and keyboard-trap (2.1.2) in-browser.
- **Section 508** — selectable standard that actually runs WCAG 2.0 A/AA rules.

---

## 6. Recommendations (to close the remaining gap)

1. Add a best-practice (non-WCAG) rule set for the highest-value axe checks
   (landmark-one-main, aria-allowed-role, duplicate-id-aria).
2. Consider a runtime second-opinion signal, or keep axe strictly as a dev/CI
   differential oracle (documented decision).
3. Make site-audit opt-in/off-switch if per-page latency is the priority.
