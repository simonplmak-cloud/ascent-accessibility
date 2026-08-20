# SWAS (Alibaba Cloud Simple Application Server) — worker + Browserless

**Status: LIVE.** The assessment worker + a co-located Browserless run on one
Alibaba Cloud SWAS instance in HK, managed by systemd.

| | |
|---|---|
| Instance ID | `e6613f06f3f6409081b2d9bd48828652` |
| Hostname | `wcag-workforce.ascent-partners.com` |
| Region / plan | `cn-hongkong` · 4 vCPU / 8GB |
| Image | Ubuntu 22.04 |
| SSH | key `~/.ssh/swas_hk_ed25519` (uploaded via the SWAS key-pair API), or root password (see `/tmp/opencode/swas.env`) |

Build/compute box: `workbench.ascent-partners.com`.

Why co-located: the worker is light (no Chrome — Browserless owns it), and the
two must be on the same box because the worker↔Browserless CDP link is the
latency-critical path.

## Layout (already deployed)

- `/opt/wcag-score/` — the repo + built worker (`dist/worker.js`).
- `/opt/wcag-score/.env` — SurrealDB + `BROWSERLESS_URL=ws://127.0.0.1:3000` + `BROWSERLESS_TOKEN` + `WORKER_*`.
- `wcag-score-worker.service` — runs `node dist/worker.js` (systemd, `Restart=always`).
- `browserless.service` — runs `ghcr.io/browserless/chromium` via Docker, bound to `127.0.0.1:3000`.

## Concurrency (4C/8G box)

The box was upgraded 2C/4G → 4C/8G. Recommended `WORKER_*` in `/opt/wcag-score/.env`
(unquoted — systemd `EnvironmentFile` does not strip quotes):

```
WORKER_SCAN_CONCURRENCY=4        # parallel page scans
WORKER_ASSESSMENT_CONCURRENCY=2  # parallel assessments
WORKER_BROWSER_POOL_SIZE=4       # warm Chromium pool
```

Total browsers = `ASSESSMENT_CONCURRENCY × SCAN_CONCURRENCY` = 8 (≈4 GB at ~500 MB
each) + browserless + the node worker — within 8 GB. To use browserless from a
*separate* box, set `BROWSERLESS_URL=ws://<other-box>:3000` and keep
`BROWSERLESS_TOKEN` in sync across both boxes.

## SSH in

```bash
ssh wcag-workforce   # == root@wcag-workforce.ascent-partners.com
ssh workbench        # == root@workbench.ascent-partners.com
```

## Deploy (code changes)

```bash
cd /opt/wcag-score && ./deploy.sh        # git pull + pnpm worker:build + systemctl restart
# or manually:
git pull && pnpm install --frozen-lockfile && pnpm worker:build && systemctl restart wcag-score-worker
```

Note: the repo is private — `git pull` needs a credential. `provision.sh` writes a
PAT to `/root/.git-credentials`; for manual deploys use a deploy key or
`.git-credentials`.

## Build a new box from GitHub

`deploy/swas/provision.sh` turns a fresh Ubuntu 22.04 box into a running
worker + Browserless, pulling everything from GitHub. The only inputs are the
secrets (passed as env vars — never committed):

```bash
# on the new box, as root:
git clone https://github.com/simonplmak-cloud/ascent-accessibility.git /tmp/wcag-score
cd /tmp/wcag-score
SURREAL_URL=... SURREAL_USERNAME=... SURREAL_PASSWORD=... GITHUB_TOKEN=... \
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
+ `SURREAL_DATABASE`, and a `GITHUB_TOKEN` (PAT with repo read). The live values
are in `/opt/wcag-score/.env` on the current box — copy them before tearing it down.

## Cut-over (done)

The Fly worker + Fly Browserless apps are **stopped**. The SWAS worker is the only
consumer of the SurrealDB queue. To revert, restart the Fly machines
(`flyctl machines start … -a wcag-score-worker` / `-a wcag-score-browserless`).

## Verify

```bash
systemctl status wcag-score-worker browserless
journalctl -u wcag-score-worker -f        # worker logs
docker logs browserless                   # browser logs
curl "http://127.0.0.1:3000/pressure?token=<BROWSERLESS_TOKEN>"
```

## Provisioning gotchas (for creating/resizing another instance)

See the `alibaba-cloud` skill (`~/.config/opencode/skills/alibaba-cloud/SKILL.md`)
for the CLI quirks: international account → `--region ap-southeast-1`, SWAS product
is `swas-open` (install the plugin), kebab-case API names, `--biz-region-id`, and
the `SYNC_PAYMENT_NOT_SUPPORT` = need cash balance (not just a card) gotcha.
