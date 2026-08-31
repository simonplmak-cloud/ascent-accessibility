# Ascent Accessibility — Flat Accessible Redesign (Spec)

**Status:** draft for review · **Target:** WCAG 2.2 AAA · **Scope:** whole site

## 1. Goals

1. **No hidden content** — nothing behind an icon, dropdown, accordion, or tab.
2. **Minimum pages, maximum coverage** — group related content from the same nav section (graph-optimized: 28 → 12 content pages).
3. **Maximum cross-linking** — related pages interlink (≈55–70 edges, reciprocal).
4. **WCAG 2.2 AAA compliant** — the site it audits must itself pass AAA.
5. **Marketing-optimized** — conversion, trust, SEO.

## 2. Design principles

- **Dense summary + visible descriptive link** to full detail (never "click here").
- **Density via structure, not shrink**: multi-column tables, 2–3-col grids, inline badges. Body prose keeps line-height ≥ 1.5, no justified text (AAA 1.4.8).
- **Every control labelled** (no icon-only); native `<select>` kept for long lists.
- **Bloomberg-terminal cues**: dense color-coded tables, ⌘K command palette, split panels where list + detail are both visible.

## 3. Information architecture (optimized)

| Hub page | Contains (anchors/sections) | From |
|---|---|---|
| Learn the basics | What is accessibility · Glossary · Validation | 3 → 1 |
| Standards (hub) | → `/standards/[id]` detail · → `/understanding/[sc]` | hub |
| Training (hub) | → paths/lessons/quizzes/certificate/faq (dynamic kept) | hub |
| Guides & how-to | Methodology · Remediation · Compliance · FAQ | 5 → 1 |
| Guide articles | Audit · Conformance · ESG · VPAT (Read full →) | 4 → 1 |
| Who we serve | Government · NGOs · ESG | 3 → 1 |
| About | About · Resources (→ Donate standalone) | 2 → 1 |
| Legal | Terms · Privacy · SLA · Refunds · A11y statement | 5 → 1 |
| Roadmap | standalone | 1 |
| Pricing / Contact / Human review / Donate | **standalone (functional)** | 4 |

**Functional (unchanged):** Assess · Auditor · Review · Report(`[id]`) · Account · API keys · Settings · Sign in · Sign up.

## 4. Navigation & chrome

- **Header** (flat, labelled, no dropdowns/hamburger):
  `[logo] Assess · Auditor · Standards · Training · Guides · About` + `Search ⌘K · My assessments · Account · Sign out · Assess your site`.
- **Footer** (flat): sitemap columns (grouped hubs) + Account/Settings + legal strip.
- **Settings**: new `/settings` page (language / text size / theme radios, always visible).

## 5. Page-by-page redesign

- **Report**: flat multi-column conformance table (all SCs visible); Methodology + Log = inline summary + same-page anchor link.
- **Review methods / conformance**: accordions → stacked visible sections/tables.
- **Standards**: dense summary table → per-standard detail (fully expanded, dense).
- **Training paths**: dense visible index → lesson detail.

## 6. Cross-linking model

- `RELATED_LINKS` map (bidirectional) + `RelatedLinks` component (visible "Related" block) on every page.
- Breadcrumbs everywhere; inline contextual links for highest-weight edges.
- Out-degree cap 4–6 per page; reciprocal.

## 7. WCAG 2.2 AAA constraints (non-negotiable)

- 1.4.6 → 7:1 contrast incl. badges/tables
- 1.4.8 → line-height ≥ 1.5, no justified, ≤ 80ch
- 1.4.9 → no text-in-image
- 2.4.9 → self-describing links
- 2.4.10 → heading hierarchy
- 2.4.12/13 → `:focus-visible` ring
- 2.5.5 → 44px targets
- 3.1.5 → plain language
- 3.3.5 → help/Related
- 2.2.2/2.3.3 → no autoplay, honor reduced-motion

## 8. Marketing optimization

- Persistent free CTA; trust signals ("Free · Open source · Registered charity"); plain-language value prop; schema (Organization + FAQPage/Article); updated sitemap + 301s.

## 9. Migration

- **301 redirects** for ~16 retired URLs → new hub/anchor.
- Re-point homepage trust-strip links; carry 3 locales per section.

## 10. Wireframes

### Chrome

```
HEADER (flat): [logo] Assess · Auditor · Standards · Training · Guides · About
               [Search ⌘K] [My assessments] [Account] [Sign out] [Assess your site]
MAIN (content)
FOOTER (flat): Learn the basics | Guides & how-to | Guide articles | Who we serve | About | Legal
               + Account column + © 2026 · terms · privacy · SLA · refunds · a11y statement
```

### Standards landing → detail

```
h1 Standards · intro · Contents(anchors)
┌ Standard ────┬ Lvl ┬ SCs ┬ Machine ┬────────────────┐
│ WCAG 2.2 AA  │ AA  │ 55  │ 43      │ View all SCs → │  → /standards/wcag22aa
│ … 10 rows …  │     │     │         │                │
└──────────────┴─────┴─────┴─────────┴────────────────┘
```

### Report

```
h1 Report — domain · [PDF] [ACR]
┌ OUTCOME: Does not conform · 38/55 SCs met · crit 2 · ser 7 · mod 4 · min 1 ┐
Top issues (5) · Review methods (expanded) ·
CONFORMANCE (flat table, all SCs): SC · Lvl · Title · Machine · AI · Verdict
Findings (dense rows) · Methodology [View full ↓] · Log [View scan log ↓]
```

### Grouped page with Related block

```
h1 Guides & how-to · breadcrumb
(content: Methodology / Remediation / Compliance / FAQ — all visible anchors)
┌ RELATED ──────────────────────────────┐
│ Standards · Learn the basics · Guide  │
│ articles · Who we serve · Human review│
└───────────────────────────────────────┘
```

## 11. Implementation phases

1. Nav flatten + settings page + footer.
2. Standards summary/detail + report flat conformance.
3. Guides/Legal/Who/About/Learn grouping + redirects.
4. Related-links component + cross-link map.
5. E2E + axe (0 violations) + deploy.

## 12. Verification

- `cs run "pnpm check && pnpm lint && pnpm test && pnpm build"`.
- E2E: update theme/marketing/assess/history; add "no `aria-expanded` nav / nav visible / descriptive links" assertions; `a11y.spec.ts` + `a11y-aaa.spec.ts` → 0 violations.
