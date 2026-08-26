# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-26

### Added

- Web accessibility assessment: submit a domain, crawl the site, and score it
  against WCAG 2.0/2.1/2.2 and Section 508.
- In-house, clean-room accessibility rules engine (no third-party engine).
- Split, DB-as-queue architecture: Next.js app + SurrealDB + self-hosted scan
  worker + co-located Browserless (headless Chromium).
- AI-assisted review for machine-untestable criteria (BYOK or provisioned keys)
  with a confidence gate and a human-review tier, plus per-criterion
  "why AI cannot decide" decision points.
- Locale-aware AI reasoning and best-effort page-language detection.
- Evidence-backed PDF report (react-pdf), with per-criterion verdicts and
  screenshots.
- Email magic-link + Google OAuth authentication (SurrealDB native).
- Stripe subscriptions and donations.
- Free structured WCAG training path (`/training/*`) with a PDF certificate.
- REST API for assessments and API keys.

[0.1.0]: https://github.com/simonplmak-cloud/ascent-accessibility/releases/tag/v0.1.0
