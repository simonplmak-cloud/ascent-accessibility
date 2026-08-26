# 03 — Public pages (holistic redesign)

All public/marketing/content pages get a consistent pass: same terminal shell,
same header/footer (Training · Auditor in nav), and every page is wired to its
role in the user journey (see 02 + 02b). Existing pages are already terminal-
themed; this pass adds the journey wiring + CTA consistency, not a re-theme.

## Home `/` — the hub (highest-priority redesign)

- Hero: one-line value prop ("Free WCAG assessment + training").
- **Dual CTA**: `[ Run a scan ]` → `/assess` (login-gated) · `[ Start training ]` → `/training`.
- Trust strip: free · WCAG 2.2 · AAA-built · sign-in to scan.
- Below the fold: (1) how it works (3 steps → scan/report), (2) training path
  preview (→ `/training`), (3) social proof / logos, (4) footer.
- `h1` once; ordered headings; `main#main`; accessible to signed-out visitors.

## Pricing `/pricing`

- Free tier (scan + training) prominent; human-review priced per page.
- CTA: `{Start free}` → `/assess` (sign-in) / `{Request quote}` → `/contact`.
- No paywall on training (label "100% free — including certificate").

## About `/about`

- Mission, team, the partner-review workforce. Trust role. Unchanged copy, nav-consistent.

## Resources `/resources`

- Articles, links, downloadable VPAT/ACR. Update `/learn` link → `/training`.
- Feeds SEO; links out to `/standards`, `/training`, `/methodology`.

## Knowledge pages (reference + funnel into training/auditor)

| Page | Role | Redesign point |
|---|---|---|
| `/standards` | WCAG criteria index | each SC deep-links `/standards/{sc}`; **add "Study this" → the SC's training lesson** |
| `/methodology` | how the scan works | link the traceability chain (UI → rule → category → SC); "Try it" → `/assess` |
| `/remediation` | remediation guidance | per-SC fixes; "Learn the SC" → `/training` |
| `/regulations` | legal landscape (HK/EU/US) | unchanged; trust role |
| `/esg` | ESG mapping | unchanged; trust role |
| `/validation` | how results are validated | reference the reviewer workforce; link `/human-review` |
| `/human-review` | the paid review service | unchanged (product page); CTA `/contact` |

## Support & giving

| Page | Role | Redesign point |
|---|---|---|
| `/faq` | support | add training + auditor Qs |
| `/contact` | support | form (unchanged) |
| `/donate` | giving | Stripe (unchanged) |
| `/roadmap` | trust | add training + auditor to the roadmap |

## Auth & account

| Page | Role | Redesign point |
|---|---|---|
| `/sign-in` · `/sign-up` | auth | unchanged flows (magic link + OAuth) |
| `/account` | profile/preferences | shows learner progress + credentials + API keys links |

## Legal (content-only, nav-consistent)

`/terms` · `/privacy` · `/sla` · `/refund` · `/accessibility-statement` — unchanged
copy; footer links stay.

## Cross-page wiring (the "holistic" part)

- Every knowledge page links **into** the training path for its topic; every SC
  reference links to `/standards/{sc}` and, where relevant, to the auditor
  traceability view.
- The header carries **Training** (public) and **Auditor** (signed-in) so every
  page funnels to one of the two pillars.
- Sitemap covers all public routes; `/auditor` + signed-in routes are excluded.
