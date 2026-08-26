# Contributing

Thanks for contributing to Ascent Accessibility. The project is licensed
[AGPL-3.0](LICENSE) — by submitting a contribution you agree to license it under
the same terms.

## Code of conduct

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting started

```bash
pnpm install
cp .env.example .env.local   # set SURREAL_* at minimum
pnpm db:migrate
pnpm dev
```

## How to contribute

1. Search [issues](https://github.com/simonplmak-cloud/ascent-accessibility/issues)
   first — a fix may already be in flight.
2. Open an issue describing the bug or proposal before large changes.
3. Fork, create a branch, and open a pull request.

## Development workflow

| Command | Purpose |
|---------|---------|
| `pnpm check` | Type-check (`tsc --noEmit`) |
| `pnpm lint` | Lint (eslint) |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | Playwright E2E (needs a running app) |
| `pnpm build` | Production build |
| `pnpm worker:build` | Bundle the scan worker |

Run `pnpm check && pnpm lint && pnpm test && pnpm build` before opening a PR.

## Testing

Unit tests live in `tests/unit/` and are pure and dependency-injected (in-memory
fakes — no DB, browser, or network). Add tests for new behavior; keep the suite
green.

## Conventions

- TypeScript everywhere (strict) — no plain `.js` in source.
- Named exports over default exports; `async`/`await` over `.then()`.
- Zod for runtime validation.
- UI primitives live in `src/components/ui/`; use them rather than hand-rolling
  Tailwind utility soup.
- Commit messages: concise, imperative mood.

## License

AGPL-3.0 — see [LICENSE](LICENSE).
