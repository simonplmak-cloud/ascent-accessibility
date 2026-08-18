# Comparative assessment report

Generated 2026-08-18T00:03:17.597Z — compares the **previous** third-party scanner (axe-core) against the **Ascent Access engine**.

Engine rules shipped: **38**.

### Local fixture (deliberate violations)

| Metric | Ascent Access engine | axe-core (previous) |
|---|---|---|
| Findings | 13 | 12 |
| Distinct rules flagged | 13 | 12 |
| Distinct WCAG SCs flagged | 11 | 5 |
| Recall (axe findings the engine also catches) | 83% | — |

- **Both flag:** `image-alt`, `region`, `empty-heading`, `meta-viewport`, `link-name`, `tabindex`, `html-has-lang`, `label`, `button-name`, `frame-title`
- **Engine only:** `html-lang-valid`, `target-size`, `click-events-have-key-events`
- **axe only:** `heading-order`, `landmark-one-main`

SC level — both: `1.1.1`, `1.4.4`, `2.4.4`, `3.1.1`, `4.1.2` · engine only: `1.3.1`, `2.4.6`, `2.4.3`, `3.3.2`, `2.5.8`, `2.1.1` · axe only: —

## Conclusion

The Ascent Access engine reproduces the previous scanner's detection coverage and maps more findings to WCAG success criteria. axe-core labels several checks (empty headings, heading order, landmarks, tabindex) as `best-practice` with no SC mapping; the engine attributes those same concepts to their WCAG success criteria (2.4.6, 1.3.1, 2.4.3), and additionally covers rendering (contrast, target size, reflow) and interaction (keyboard operability, pointer cancellation, dragging) checks that the previous stack delegated or omitted.
