# ADR 002 — Inject axe-core via `addInitScript`, never `addScriptTag`

**Status:** Accepted

## Context
`page.addScriptTag` inlines the axe-core script into the page, which strict
Content-Security-Policy on target sites blocks, causing scans to fail.

## Decision
Inject axe-core with `page.addInitScript({ path: "axe-core/axe.min.js" })`, which runs at the CDP
level before the page loads and bypasses CSP.

## Consequences
- Scans work on CSP-locked sites.
- The same init-script mechanism is reused to capture evidence (highlight overlays) and run IBM
  Equal Access.
