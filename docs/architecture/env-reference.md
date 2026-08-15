# Environment variables

| Variable | Required | Used by | Notes |
|---|---|---|---|
| `SURREAL_URL` | yes | web, worker | SurrealDB endpoint |
| `SURREAL_USERNAME` | yes* | web, worker | namespace-scoped sign-in |
| `SURREAL_PASSWORD` | yes* | web, worker | |
| `SURREAL_NAMESPACE` | yes | web, worker | default `wcag-score` |
| `SURREAL_DATABASE` | yes | web, worker | default `main` |
| `SURREAL_TOKEN` | alt | web, worker | token auth (instead of user/pass) |
| `BROWSERLESS_URL` | yes | worker, export | CDP endpoint (`wss://chrome.browserless.io`) |
| `BROWSERLESS_TOKEN` | yes | worker, export | CDP token |
| `STRIPE_SECRET_KEY` | no | web | donation checkout (graceful 502 without) |
| `NEXT_PUBLIC_SITE_URL` | no | web, stripe | canonical site URL |
| `WORKER_POLL_INTERVAL_MS` | no | worker | default 5000 |
| `WORKER_BATCH_SIZE` | no | worker | default 5 |
| `WORKER_SCAN_CONCURRENCY` | no | worker | default 5 |
| `WORKER_STALE_RUNNING_MINUTES` | no | worker | default 10 |
| `VERCEL_ACCESS_TOKEN` | deploy | CI | Vercel API |
| `FLY_API_TOKEN` | deploy | CI | Fly API (contains a literal comma) |

\* `SURREAL_USERNAME`/`SURREAL_PASSWORD` or `SURREAL_TOKEN` — one of the two.

Secrets live in `~/.env.opencode` locally and in Fly/Vercel secrets — never committed.
