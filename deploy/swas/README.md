# SWAS (Alibaba Cloud Simple Application Server) — worker + Browserless

The assessment worker + a co-located Browserless run on a single Linux box,
managed by systemd. The worker is light (no Chrome — Browserless owns it), and
the two are co-located because the worker↔Browserless CDP link is the
latency-critical path.

## Layout

- `/opt/wcag-score/` — the repo + built worker (`dist/worker.js`).
- `/opt/wcag-score/.env` — SurrealDB + `BROWSERLESS_URL=ws://127.0.0.1:3000` + `BROWSERLESS_TOKEN` + `WORKER_*`.
- `wcag-score-worker.service` — runs `node dist/worker.js` (systemd, `Restart=always`).
- `browserless.service` — runs `ghcr.io/browserless/chromium` via Docker, bound to `127.0.0.1:3000`.

## Deploy (code changes)

```bash
cd /opt/wcag-score && ./deploy.sh        # git pull + pnpm worker:build + systemctl restart
```

## Build a new box from GitHub

`deploy/swas/provision.sh` turns a fresh Ubuntu 22.04 box into a running
worker + Browserless, pulling everything from GitHub. The only inputs are the
secrets (passed as env vars — never committed):

```bash
git clone https://github.com/<org>/ascent-accessibility.git /tmp/wcag-score
cd /tmp/wcag-score
SURREAL_URL=... SURREAL_USERNAME=... SURREAL_PASSWORD=... \
  deploy/swas/provision.sh
```

It installs Node 20 / pnpm 10 / Docker, clones the repo, builds `dist/worker.js`,
generates a `BROWSERLESS_TOKEN` if unset, writes `.env`, installs both systemd
units, pulls the Browserless image, and starts everything. Idempotent.

Gotchas it encodes for you:

- The worker `.env` is read by systemd `EnvironmentFile`, which does **not**
  strip quotes — values must be unquoted and free of `$`/spaces/`#`.
- `browserless.service` sources the same `.env`, so the container token and the
  worker's `BROWSERLESS_TOKEN` can never drift.
- The systemd units are installed from the freshly-cloned repo
  (`deploy/swas/*.service`), not from wherever the script was run.

**Secrets you must supply (not in git):** `SURREAL_URL` +
`SURREAL_USERNAME`/`SURREAL_PASSWORD` (or `SURREAL_TOKEN`) + `SURREAL_NAMESPACE`
+ `SURREAL_DATABASE`. See `.env.example`.

## Verify

```bash
systemctl status wcag-score-worker browserless
journalctl -u wcag-score-worker -f        # worker logs
docker logs browserless                   # browser logs
curl "http://127.0.0.1:3000/pressure?token=<BROWSERLESS_TOKEN>"
```

For the full ground-up self-hosting guide, see [`docs/self-hosting.md`](../../docs/self-hosting.md).
