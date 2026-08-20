#!/usr/bin/env bash
# Provision a FRESH Ubuntu 22.04 box as the wcag-score worker + Browserless host,
# pulling all code from GitHub. Run as root on a new SWAS instance.
#
# The only thing this script cannot provide is the secrets — supply them via
# environment variables (never commit them to git):
#
#   SURREAL_URL                         (required)
#   SURREAL_TOKEN                       (either this OR username+password)
#   SURREAL_USERNAME / SURREAL_PASSWORD (required if no SURREAL_TOKEN)
#   SURREAL_NAMESPACE  (default: wcag-score)
#   SURREAL_DATABASE   (default: main)
#   GITHUB_TOKEN        (required — PAT with repo read; used to clone + persist
#                        /root/.git-credentials so future `git pull` works)
#   BROWSERLESS_TOKEN   (optional — auto-generated via `openssl rand -hex 24`)
#   WORKER_POLL_INTERVAL_MS / WORKER_SCAN_CONCURRENCY / WORKER_ASSESSMENT_CONCURRENCY
#                        (optional — sensible production defaults below)
#
# Example (run on the new box as root):
#   ssh root@<IP>
#   git clone https://github.com/simonplmak-cloud/ascent-accessibility.git /tmp/wcag-score
#   cd /tmp/wcag-score && \
#     SURREAL_URL=... SURREAL_USERNAME=... SURREAL_PASSWORD=... GITHUB_TOKEN=... \
#     deploy/swas/provision.sh
#
# Idempotent — safe to re-run.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/wcag-score}"
REPO="${REPO:-https://github.com/simonplmak-cloud/ascent-accessibility.git}"
NODE_MAJOR="${NODE_MAJOR:-20}"
PNPM_VERSION="${PNPM_VERSION:-10}"

export DEBIAN_FRONTEND=noninteractive

# --- 1. System packages -----------------------------------------------------
apt-get update -y
apt-get install -y git curl ca-certificates gnupg openssl

# Node.js LTS (NodeSource)
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

# pnpm
if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g "pnpm@${PNPM_VERSION}"
fi

# Docker
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

# --- 2. Git credential (for clone + future `git pull`) ----------------------
if [ -n "${GITHUB_TOKEN:-}" ]; then
  printf 'https://x-access-token:%s@github.com\n' "$GITHUB_TOKEN" > /root/.git-credentials
  chmod 600 /root/.git-credentials
  git config --global credential.helper store
  git config --global user.email "simonplmak-cloud@users.noreply.github.com"
  git config --global user.name "noreply"
fi

# --- 3. Clone + build -------------------------------------------------------
if [ ! -d "$APP_DIR/.git" ]; then
  : "${GITHUB_TOKEN:?GITHUB_TOKEN is required for the initial clone}"
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"
git fetch origin && git reset --hard origin/main

pnpm install --frozen-lockfile
pnpm worker:build

# --- 4. Secrets (unquoted — systemd EnvironmentFile does not strip quotes) ---
: "${SURREAL_URL:?SURREAL_URL is required}"
if [ -z "${SURREAL_TOKEN:-}" ]; then
  : "${SURREAL_USERNAME:?SURREAL_USERNAME is required (or set SURREAL_TOKEN)}"
  : "${SURREAL_PASSWORD:?SURREAL_PASSWORD is required (or set SURREAL_TOKEN)}"
fi
BROWSERLESS_TOKEN="${BROWSERLESS_TOKEN:-$(openssl rand -hex 24)}"

umask 077
{
  printf 'SURREAL_URL=%s\n' "$SURREAL_URL"
  printf 'SURREAL_NAMESPACE=%s\n' "${SURREAL_NAMESPACE:-wcag-score}"
  printf 'SURREAL_DATABASE=%s\n' "${SURREAL_DATABASE:-main}"
  if [ -n "${SURREAL_TOKEN:-}" ]; then
    printf 'SURREAL_TOKEN=%s\n' "$SURREAL_TOKEN"
  else
    printf 'SURREAL_USERNAME=%s\n' "$SURREAL_USERNAME"
    printf 'SURREAL_PASSWORD=%s\n' "$SURREAL_PASSWORD"
  fi
  printf 'BROWSERLESS_URL=%s\n' "${BROWSERLESS_URL:-ws://127.0.0.1:3000}"
  printf 'BROWSERLESS_TOKEN=%s\n' "$BROWSERLESS_TOKEN"
  printf 'WORKER_POLL_INTERVAL_MS=%s\n' "${WORKER_POLL_INTERVAL_MS:-500}"
  printf 'WORKER_SCAN_CONCURRENCY=%s\n' "${WORKER_SCAN_CONCURRENCY:-4}"
  printf 'WORKER_ASSESSMENT_CONCURRENCY=%s\n' "${WORKER_ASSESSMENT_CONCURRENCY:-2}"
  printf 'WORKER_BROWSER_POOL_SIZE=%s\n' "${WORKER_BROWSER_POOL_SIZE:-4}"
  printf 'EVIDENCE_ELEMENT_LIMIT=%s\n' "${EVIDENCE_ELEMENT_LIMIT:-0}"
} > "$APP_DIR/.env"

# --- 5. systemd units (from the freshly-cloned repo — single source of truth)
install -m 0644 "$APP_DIR/deploy/swas/wcag-score-worker.service" /etc/systemd/system/
install -m 0644 "$APP_DIR/deploy/swas/browserless.service" /etc/systemd/system/
systemctl daemon-reload

# Pull the browserless image up front so a registry failure is visible now,
# not silently retried later by the worker.
docker pull ghcr.io/browserless/chromium

systemctl enable --now browserless
systemctl enable --now wcag-score-worker

echo
echo "Provisioned. Verify:"
echo "  systemctl status browserless wcag-score-worker"
echo "  journalctl -u wcag-score-worker -f"
