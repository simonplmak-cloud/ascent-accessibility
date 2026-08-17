#!/usr/bin/env bash
# Deploy the latest worker build on the SWAS box.
set -euo pipefail

cd /opt/wcag-score

echo "== git pull =="
git pull origin main

echo "== install + build =="
pnpm install --frozen-lockfile
pnpm worker:build

echo "== restart worker =="
systemctl restart wcag-score-worker

echo "== status =="
systemctl --no-pager status wcag-score-worker | head -n 5
