#!/usr/bin/env bash

set -euo pipefail

required_vars=(
  PROD_SLOT_HOST
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

deploy_slot="${TARGET_DEPLOY_SLOT:-${TARGET_SLOT:-}}"

if [[ -z "${deploy_slot}" ]]; then
  echo "Missing required environment variable: TARGET_DEPLOY_SLOT or TARGET_SLOT" >&2
  exit 1
fi

api_port="${PROD_API_PORT:-3001}"
ui_port="${PROD_UI_PORT:-5173}"
base_url="http://${PROD_SLOT_HOST}:${api_port}"
ui_url="http://${PROD_SLOT_HOST}:${ui_port}"

echo "Waiting for production slot ${deploy_slot} backend health endpoint..."
for attempt in $(seq 1 12); do
  if curl -fsS "${base_url}/api/health" >/dev/null; then
    break
  fi

  if [ "$attempt" -eq 12 ]; then
    echo "Production slot ${deploy_slot} backend did not become ready in time." >&2
    exit 1
  fi

  sleep 5
done

curl -fsS "${base_url}/api/notes" >/dev/null
curl -fsSI "${ui_url}" >/dev/null

echo "Production smoke tests passed for slot ${deploy_slot}."
