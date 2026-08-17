# SWAS (Alibaba Cloud Simple Application Server) migration

Run the assessment worker + a self-hosted Browserless on one Alibaba Cloud SWAS
instance (HK region). Both are long-lived processes managed by systemd, so the
browser stays warm and the worker survives reboots.

Why this layout: the worker is light (no Chrome — Browserless owns it), and the
two must be **co-located** because the worker↔Browserless CDP link is the
latency-critical path. HK region also cuts latency to HK target sites
(`dialogue-experience.hk` measured 4.6s from Singapore vs 1.3s from HK).

## Prerequisites

- SWAS instance: **≥ 2 vCPU / 4 GB RAM**, HK region, Ubuntu 22.04+.
- Root SSH access.

## One-time setup (run as root on the SWAS box)

```bash
# Node 20 + pnpm + Docker
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs docker.io
npm install -g pnpm@10
systemctl enable --now docker

# Clone the repo
mkdir -p /opt/wcag-score && cd /opt/wcag-score
git clone https://github.com/simonplmak-cloud/wcag-score.git .
pnpm install --frozen-lockfile
pnpm worker:build   # -> dist/worker.js
```

## 1. Environment file — `/opt/wcag-score/.env`

```bash
# SurrealDB (same as Fly/Vercel secrets)
SURREAL_URL=...
SURREAL_USERNAME=...
SURREAL_PASSWORD=...
SURREAL_NAMESPACE=wcag-score
SURREAL_DATABASE=main

# Browserless — co-located on this box
BROWSERLESS_URL=ws://127.0.0.1:3000
BROWSERLESS_TOKEN=<shared secret, must match browserless.service>

# Worker tuning (optional)
WORKER_POLL_INTERVAL_MS=1000
WORKER_BATCH_SIZE=5
WORKER_SCAN_CONCURRENCY=2
WORKER_ASSESSMENT_CONCURRENCY=2
WORKER_PAGE_TIMEOUT_MS=180000
```

## 2. systemd units

Copy `wcag-score-worker.service` and `browserless.service` to
`/etc/systemd/system/`, then:

```bash
systemctl daemon-reload
systemctl enable --now browserless
systemctl enable --now wcag-score-worker
systemctl status wcag-score-worker browserless
```

## 3. Deploy (code changes)

Run `./deploy.sh` (or `systemctl restart wcag-score-worker` after rebuilding):

```bash
cd /opt/wcag-score && ./deploy.sh
```

## 4. Cut over

The worker on SWAS polls the **same SurrealDB** as the Fly worker, so they'd
race to claim assessments. Stop the Fly worker first:

```bash
flyctl machines stop 48ee716f3dd428 -a wcag-score-worker
```

(Do this only after the SWAS worker is confirmed healthy — see logs with
`journalctl -u wcag-score-worker -f`.)

## 5. Verify

Run a scan and confirm it completes; the HK comparison should now show
`dialogue-experience.hk` page loads at ~1.3s instead of ~4.6s.
