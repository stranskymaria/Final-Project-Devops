#!/usr/bin/env bash

set -euo pipefail

required_vars=(
  TARGET_SLOT
  PROD_SLOT_HOST
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

api_port="${PROD_API_PORT:-3001}"
ui_port="${PROD_UI_PORT:-5173}"
base_url="http://${PROD_SLOT_HOST}:${api_port}"
ui_url="http://${PROD_SLOT_HOST}:${ui_port}"

echo "Waiting for production slot ${TARGET_SLOT} backend health endpoint..."
for attempt in $(seq 1 12); do
  if curl -fsS "${base_url}/api/health" >/dev/null; then
    break
  fi

  if [ "$attempt" -eq 12 ]; then
    echo "Production slot ${TARGET_SLOT} backend did not become ready in time." >&2
    exit 1
  fi

  sleep 5
done

curl -fsS "${base_url}/api/notes" >/dev/null
curl -fsSI "${ui_url}" >/dev/null

echo "Production smoke tests passed for slot ${TARGET_SLOT}."
