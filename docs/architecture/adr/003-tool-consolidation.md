# ADR 003 — Consolidate axe + Lighthouse-comparable + IBM Equal Access

**Status:** Accepted

## Context
No single automated engine covers WCAG fully. axe-core (our base) is broad but misses
text-spacing/orientation/label-in-name rules that IBM Equal Access catches; Lighthouse's
accessibility score is a widely-recognized 0–100 signal but is a subset of axe.

## Decision
Run axe-core (with `wcag` + `best-practice` tags) as the primary engine, run IBM Equal Access per
page, and derive a Lighthouse-comparable score from the same axe result using Lighthouse's
published audit weights. Consolidate the results into a **union** (deduped by SC + page), each
finding carrying a `sources` attribution and a `confidence` (confirmed / single-source). Every
finding chains to a WCAG SC via axe `wcagNNN` tags.

## Consequences
- Broader coverage (IBM-only rules surface) and a transparent cross-tool comparison.
- The headline score is our severity-weighted 0–100; the Lighthouse column is a comparable
  reference, not a compliance claim.
- Automated results are labeled "preliminary"; Lighthouse manual checks surface as a review
  checklist.
