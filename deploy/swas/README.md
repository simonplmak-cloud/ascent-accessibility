# SWAS (Alibaba Cloud Simple Application Server) — worker + Browserless

**Status: LIVE.** The assessment worker + a co-located Browserless run on one
Alibaba Cloud SWAS instance in HK, managed by systemd.

| | |
|---|---|
| Instance ID | `e6613f06f3f6409081b2d9bd48828652` |
| Public IP | `47.243.145.140` |
| Region / plan | `cn-hongkong` · `swas.s.c2m4s50b1.linux` (2 vCPU / 4GB) |
| Image | Ubuntu 22.04 |
| SSH | key `~/.ssh/swas_hk_ed25519` (uploaded via the SWAS key-pair API), or root password (see `/tmp/opencode/swas.env`) |

Why co-located: the worker is light (no Chrome — Browserless owns it), and the
two must be on the same box because the worker↔Browserless CDP link is the
latency-critical path.

## Layout (already deployed)

- `/opt/wcag-score/` — the repo + built worker (`dist/worker.js`).
- `/opt/wcag-score/.env` — SurrealDB + `BROWSERLESS_URL=ws://127.0.0.1:3000` + `BROWSERLESS_TOKEN` + `WORKER_*`.
- `wcag-score-worker.service` — runs `node dist/worker.js` (systemd, `Restart=always`).
- `browserless.service` — runs `ghcr.io/browserless/chromium` via Docker, bound to `127.0.0.1:3000`.

## SSH in

```bash
ssh -i ~/.ssh/swas_hk_ed25519 root@47.243.145.140
```

## Deploy (code changes)

```bash
cd /opt/wcag-score && ./deploy.sh        # git pull + pnpm worker:build + systemctl restart
# or manually:
git pull && pnpm install --frozen-lockfile && pnpm worker:build && systemctl restart wcag-score-worker
```

Note: the repo is private — `git pull` needs a credential. Use the GitHub PAT /
`gh auth token` (a deploy key or a stored `.git-credentials` is cleaner long-term).

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
