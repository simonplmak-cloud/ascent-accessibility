# Web Accessibility — Curriculum (3-credit course)

A performance-based, 3-semester-credit course that builds — not just surveys — web
accessibility competence. Students leave with an accessible implementation, a
reproducible manual/assistive-technology test record, a prioritized audit, remediation
evidence, and the ability to explain actual user impact (not merely recall SC numbers).

## Overview

| | |
|---|---|
| **Course** | Web Accessibility |
| **Credits / workload** | 3 semester credits · **135 hours** (45 contact + 90 study) · 15 weeks |
| **Progression** | Advocacy → Everyday → Standards → Audit |
| **Prerequisites** | HTML/CSS familiarity recommended; no JavaScript required |
| **Audience** | CS / HCI / design students and practitioners; no accessibility background assumed |
| **Assessment model** | Performance-based (labs, build, audit, capstone) with low-stakes conceptual quizzes |
| **Alignment** | Maps to IAAP **CPACC** (Unit 1) and **WAS** (Units 2–4) Bodies of Knowledge |

## Learning outcomes

By the end of the course a student will be able to:

1. **Understand** the social, business, and legal case for web accessibility and describe how people with disabilities use assistive technologies. *(Bloom: understand/analyze)*
2. **Apply** remediation to common accessibility barriers (alt text, contrast, keyboard, forms, structure). *(apply)*
3. **Interpret** WCAG 2.2 — POUR, A/AA/AAA — and **analyze** any success criterion via its guideline, Understanding document, and Techniques. *(analyze)*
4. **Evaluate** conformance using automated, manual, and screen-reader methods against a defined test matrix. *(evaluate)*
5. **Create** an accessible implementation plus an evidence-based WCAG-EM report and VPAT/ACR. *(create)*
6. **Trace** the evolution of WCAG 1.0 → 2.2 → 3.0 and situate it among related standards (Section 508, EN 301 549, ATAG, UAAG, WAI-ARIA). *(understand)*

## Pedagogical cycle (W3C Developer Modules)

Every technical lesson follows the same loop — it is the course's core teaching method:

```
explain the user need  →  inspect a real failure  →  implement with native HTML
      →  test by keyboard / assistive technology  →  map to WCAG  →  document evidence
```

Rules derived from this: **native HTML before ARIA**, **accessible example before
inaccessible**, and **"why a user needs this" before "how to pass a checklist"**.

---

## Unit 1 — Advocacy (~22 h · Weeks 1–3)

Why accessibility matters. Six concept lessons, each with a reflective or
low-stakes-check activity. Closes with the history/standards lesson.

| # | Lesson | Key content | Primary resource |
|---|---|---|---|
| 1.1 | What is web accessibility | accessibility vs usability vs inclusive design; POUR in one line | WAI *Digital Accessibility Foundations* |
| 1.2 | How people use the web | AT: screen readers, magnification, keyboard, voice, switches | WAI *How People with Disabilities Use the Web* + *Stories of Web Users* |
| 1.3 | Disability types & barriers | visual / auditory / motor / cognitive; permanent–temporary–situational | WebAIM *Introduction to Web Accessibility* |
| 1.4 | Business + legal case | innovation, market reach, legal risk; ADA, Section 508, EN 301 549 | WAI *Business Case* + *Laws & Policies* |
| 1.5 | Inclusive design & etiquette | "solve for one, extend to many"; person-first vs identity-first language | Microsoft *Inclusive Design Toolkit*; ADA Network language guide |
| 1.6 | **History of WCAG & standards** | WCAG 1.0 (1999) → 2.0 POUR shift (2008) → 2.1 (2018) → 2.2 (2023) → 3.0; Section 508, EN 301 549, ATAG, UAAG, WAI-ARIA, ISO/IEC 40500 | WCAG 2.0/2.1/2.2 specs; *What's New in WCAG 2.2* |

**Unit 1 deliverable:** a short reflective write-up anchored in a WAI *user story*
(the **user-impact baseline** — students must cite a named persona and explain a real
barrier + assistive strategy). This is the first of the recurring "explain user impact"
requirements. *(CPACC domains: disabilities/AT, universal design, law/standards.)*

---

## Unit 2 — Everyday accessibility (~38 h · Weeks 4–7)

Common barriers and quick wins — taught through the pedagogical cycle. The
**cumulative build project** begins here: students start a small site that they will
make, audit, and remediate across Units 2–4.

| # | Lesson (apply-level) | SCs | Primary resource |
|---|---|---|---|
| 2.1 | Semantics & structure | 1.3.1, 2.4.6 | WAI *Page Structure*; WebAIM *Semantic Structure* |
| 2.2 | Text alternatives | 1.1.1 | WAI *Images tutorial*; WebAIM *Alternative Text* |
| 2.3 | Colour & contrast | 1.4.1, 1.4.3, 1.4.11 | web.dev *Color and contrast*; WebAIM contrast checker |
| 2.4 | Keyboard & focus | 2.1.1, 2.4.7, 2.4.11 | web.dev *Keyboard focus*; MDN keyboard |
| 2.5 | Links & navigation | 2.4.4, 2.4.1 | WAI *Tips — Writing* |
| 2.6 | Forms & errors | 3.3.1, 3.3.2, 4.1.2 | WebAIM *Forms* |
| 2.7 | Media (captions/audio) | 1.2.1, 1.2.2, 1.4.2 | WAI *Media*; web.dev *Media* |
| 2.8 | Zoom, reflow & target size | 1.4.4, 1.4.10, 2.5.8 | WAI *Easy Checks*; web.dev *Responsive* |

**Unit 2 labs (weekly):** diagnose-and-remediate exercises (broken-page repair with
worked solutions, Udacity-style) + the first build milestone (semantic page).

---

## Unit 3 — Standards (~38 h · Weeks 8–11)

Depth + method, not rote coverage. Students learn **how to read any SC**, then deep-dive
a small set of high-impact criteria. All 87 SCs remain available as reference.

### 3.0 — How to read any SC (the meta-skill)
`SC number → principle → guideline → Understanding doc (intent/benefits/examples) →
Techniques (sufficient/advisory/failures) → how to test it`. Students practice this on
an unfamiliar SC to prove they can self-serve the standard.

### Anchor SCs (deep-dive — the ~10 behind ~80% of real failures)

| SC | Title | Teach (user need → failure → native fix → test) |
|---|---|---|
| 1.1.1 | Non-text Content | alt text decision tree (informative/decorative/functional/complex) |
| 1.3.1 | Info and Relationships | headings, landmarks, lists, tables, `<label>` |
| 1.4.3 | Contrast (Minimum) | 4.5:1 text / 3:1 large; real-world contrast checks |
| 1.4.10 | Reflow | 320px & 400% zoom, no two-dimensional scroll |
| 2.1.1 | Keyboard | every interaction keyboard-operable; focus order |
| 2.4.4 | Link Purpose (In Context) | link text describes destination, out of context |
| 2.4.7 | Focus Visible | visible focus indicator, never removed |
| 3.3.1 | Error Identification | text errors + focus + `aria-describedby` |
| 4.1.2 | Name, Role, Value | native controls; accessible name for custom UI |
| 2.5.8 | Target Size (Minimum) | 24×24 px targets/spacing (WCAG 2.2) |

### 3.x — One restrained ARIA lesson (after native HTML)
Dialogs, live regions (`aria-live`), custom controls — with the rule: *ARIA communicates
semantics but does not supply keyboard behavior*; use native first.

### Reference taxonomy — 87 SCs in 13 guidelines (not taught rote)

| Principle | Guideline (reference) | SCs |
|---|---|---|
| Perceivable | 1.1 Text Alternatives · 1.2 Time-based Media · 1.3 Adaptable · 1.4 Distinguishable | 1 + 9 + 6 + 13 = 29 |
| Operable | 2.1 Keyboard Accessible · 2.2 Enough Time · 2.3 Seizures & Physical Reactions · 2.4 Navigable · 2.5 Input Modalities | 4 + 6 + 3 + 13 + 8 = 34 |
| Understandable | 3.1 Readable · 3.2 Predictable · 3.3 Input Assistance | 6 + 6 + 9 = 21 |
| Robust | 4.1 Compatible | 3 |

*(Total 87. In the app this is the existing `/standards` index + `src/lib/standards/*`
data — `getSc`, `getManualTest`, `getScRemediation`, `version`, `nature`.)*

**Unit 3 assessments:** per-principle **scenario/application** quizzes (no recall) +
a "read an unfamiliar SC" exercise.

---

## Unit 4 — Audit (~37 h · Weeks 12–15)

Evaluation and reporting — culminating in the capstone.

| # | Lesson | Key content | Primary resource |
|---|---|---|---|
| 4.1 | Evaluation overview | tools assist, humans judge; no tool alone determines conformance | WAI *Evaluating Web Accessibility Overview* |
| 4.2 | Easy Checks | first review: titles, headings, contrast, alt, keyboard, zoom | WAI *Easy Checks* |
| 4.3 | Automated tools | axe / WAVE / Lighthouse — findings vs false positives | WebAIM *WAVE*; Microsoft *Accessibility Insights* |
| 4.4 | Manual testing | keyboard, focus order, contrast, forms, reflow | WebAIM *Evaluation Guide* |
| 4.5 | Screen-reader testing | NVDA + Chrome, VoiceOver + Safari; reading order, landmarks, forms | WebAIM *Using NVDA / VoiceOver* |
| 4.6 | WCAG-EM + VPAT/ACR | scope → explore → sample → evaluate → report; VPAT is a template, an ACR is a completed one | W3C *WCAG-EM*; ITI *VPAT*; section508.gov ACR guide |

**Defined test matrix (required across all audits):** NVDA + Chrome (Windows) ·
VoiceOver + Safari (macOS) · keyboard-only · 400% zoom · automated (axe + one other).

### Capstone (Weeks 13–15)
Finalize the built site → full WCAG-EM evaluation → evidence-based report →
VPAT/ACR → **short defense**. Deliverables via Git. Graded against a rubric
(user impact, code quality, keyboard/AT behavior, standards reasoning, evidence,
communication) — not automated-violation counts.

---

## Cumulative build project (Units 2–4)

One small site, built then repeatedly audited and remediated:
- **Week 4–7:** build the semantic, accessible baseline.
- **Week 8–11:** add interactive controls (forms, dialogs) and fix against the anchor SCs.
- **Week 12–15:** final audit + remediation + report + VPAT.

## Resource library

| Unit | Canonical free resources | Supplementary |
|---|---|---|
| 1 | WAI Foundations / People Use the Web / Business Case / Laws & Policies; WebAIM Intro; Microsoft Inclusive Design | WHO World Report on Disability; ADA Network |
| 2 | WAI Tips + tutorials; WebAIM techniques; MDN; web.dev Learn Accessibility; A11y Project Checklist; BBC HTML | — |
| 3 | WCAG 2.2 + Understanding + How to Meet + Techniques; WebAIM WCAG Checklist | MDN Understanding WCAG |
| 4 | WAI test-evaluate / Easy Checks / WCAG-EM / Report Tool / Template; WebAIM Eval Guide + WAVE + NVDA/VoiceOver; Accessibility Insights; ITI VPAT | Deque (paid) |

## IAAP alignment

| Unit | Maps to | Notes |
|---|---|---|
| 1 · Advocacy | **CPACC** (40% disabilities/AT · 40% universal design · 20% law/standards) | the human + policy foundation |
| 2–4 · Everyday/Standards/Audit | **WAS** (40% create · 40% identify · 20% remediate) | the technical spine |

The syllabus states the course *prepares toward* CPACC/WAS; it does not confer the
credentials (which require IAAP's own exams).
