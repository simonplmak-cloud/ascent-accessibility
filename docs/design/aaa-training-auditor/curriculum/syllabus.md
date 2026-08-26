# Web Accessibility — Syllabus (3 credits)

## Course information

| | |
|---|---|
| **Course** | Web Accessibility |
| **Credits / hours** | 3 semester credits · **135 hours** (45 contact + 90 study) · 15 weeks |
| **Prerequisites** | HTML/CSS familiarity recommended; no JavaScript required |
| **Audience** | CS / HCI / design students and practitioners |
| **Modality** | Lectures + weekly labs; cumulative project; final defense |
| **Alignment** | Prepares toward IAAP **CPACC** (Unit 1) and **WAS** (Units 2–4); does not confer the credentials |

## Learning outcomes

| # | Outcome | Bloom level |
|---|---|---|
| 1 | Explain the social/business/legal case and how people with disabilities use the web | understand · analyze |
| 2 | Apply remediation to common barriers (alt text, contrast, keyboard, forms, structure) | apply |
| 3 | Interpret WCAG 2.2 and analyze any SC via guideline / Understanding / Techniques | analyze |
| 4 | Evaluate conformance with automated, manual, and screen-reader methods | evaluate |
| 5 | Create an accessible implementation + WCAG-EM report + VPAT/ACR | create |
| 6 | Trace WCAG 1.0→3.0 and situate it among related standards | understand |

## Constructive alignment (outcome ↔ assessment)

| Outcome | Quiz | Labs | Case study | Capstone |
|---|---|---|---|---|
| 1 — understand/analyze | ● | | ● | |
| 2 — apply | | ● | ● | |
| 3 — interpret/analyze | ● | ● | ● | |
| 4 — evaluate | | ● | ● | ● |
| 5 — create | | ● | | ● |
| 6 — understand | ● | | | |

## Grading scheme

| Component | Weight | Notes |
|---|---|---|
| Weekly implementation labs (6) | **30%** | Git-delivered; rubric-scored; best 5 of 6 |
| Conceptual quizzes (4, per unit) | **15%** | low-stakes; application/scenario, not recall |
| Audit + remediation case study | **20%** | real-site analysis incl. a user-impact analysis |
| Capstone (build + WCAG-EM report + VPAT + defense) | **35%** | Weeks 13–15; rubric-scored |

**Passing requirement:** students must pass the capstone and achieve ≥ 50% on the
practical (labs + case study + capstone) component *and* ≥ 50% on the quizzes — a
conceptual score alone cannot pass the course.

## Rubric dimensions (labs + capstone)

Each graded artifact is scored on:

1. **User impact** — correctly explains who is affected and how.
2. **Code quality** — valid native HTML, semantic structure.
3. **Keyboard & AT behavior** — observable operation, not just markup.
4. **Standards reasoning** — accurate WCAG mapping and level.
5. **Evidence** — reproducible steps, screenshots/recordings, test-matrix results.
6. **Communication** — clear findings, severity, and remediation guidance.

*(Rubrics reward demonstrated competence, never automated-violation counts alone.)*

## 15-week schedule

| Weeks | Unit | Focus | Assessments |
|---|---|---|---|
| 1–3 | Advocacy | disability, AT, business/legal, history/standards | Quiz 1 · user-story reflection |
| 4–7 | Everyday | structure→media via the W3C cycle; build begins | Labs 1–3 · Quiz 2 |
| 8–11 | Standards | SC-reading method + 10 anchor SCs + ARIA | Labs 4–5 · per-principle quizzes · case study |
| 12–15 | Audit | evaluation methods + capstone | Lab 6 · Capstone + defense |

## Required materials (all free)

**Primary (normative):** WCAG 2.2 · Understanding WCAG 2.2 · Techniques · How to Meet
(Quick Reference) · WCAG-EM 2.0 · WAI Developer Modules.

**Evidence (research):** WHO *World Report on Disability* · WebAIM *Screen Reader User
Survey* (annual) · WAI *How People with Disabilities Use the Web*.

**Practice:** web.dev *Learn Accessibility* · MDN *Accessibility module* · WebAIM
techniques + WAVE · Microsoft *Accessibility Insights* · ITI *VPAT* templates.

## Defined test matrix

All audits and the capstone must document testing with **at least**:

- NVDA + Chrome (Windows) · VoiceOver + Safari (macOS)
- Keyboard-only operation
- 400% zoom / 320 px reflow
- Automated (axe) + one additional tool (WAVE or Lighthouse)

## Policies

- **Academic integrity:** all code, audits, and reports must be the student's own;
  tool output must be reproduced and interpreted, not fabricated.
- **Accessibility & inclusion (UDL):** this course models what it teaches — materials
  are provided in multiple formats; captioning/transcripts and alternative text are
  standard. Students requiring accommodations should contact the instructor; requests
  are treated confidentially.
- **Lived experience:** engagement with disabled people's perspectives is via WAI user
  stories and, where available, invited speakers; simulations are not a substitute for
  lived experience.

## IAAP alignment

| Unit | IAAP Body of Knowledge |
|---|---|
| 1 · Advocacy | CPACC — disabilities/AT (40%), universal design (40%), standards/law/management (20%) |
| 2–4 | WAS — creating accessible solutions (40%), identifying issues (40%), remediation (20%) |

This course prepares students toward those credentials; IAAP exams are external and
require the student to register separately.
