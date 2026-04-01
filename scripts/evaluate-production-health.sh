#!/usr/bin/env bash

set -euo pipefail

# This script updates the monitoring state between scheduled Jenkins runs.
required_vars=(
  PROD_PUBLIC_BASE_URL
  MONITOR_STATE_DIR
  FAILURE_THRESHOLD_RESOLVED
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

mkdir -p "${MONITOR_STATE_DIR}"

# Keep separate counters for frontend and backend so recovery can target only the failing service.
frontend_fail_file="${MONITOR_STATE_DIR}/frontend_fail_count"
backend_fail_file="${MONITOR_STATE_DIR}/backend_fail_count"
status_file="${MONITOR_STATE_DIR}/monitoring-status.env"

frontend_fail_count=0
backend_fail_count=0

if [[ -f "${frontend_fail_file}" ]]; then
  frontend_fail_count="$(tr -d '[:space:]' < "${frontend_fail_file}")"
fi

if [[ -f "${backend_fail_file}" ]]; then
  backend_fail_count="$(tr -d '[:space:]' < "${backend_fail_file}")"
fi

frontend_status="healthy"
backend_status="healthy"
recover_frontend="false"
recover_backend="false"

# Poll the public production endpoints exposed through Nginx.
if ! curl -fsSI "${PROD_PUBLIC_BASE_URL}/" >/dev/null; then
  frontend_status="failed"
  frontend_fail_count=$((frontend_fail_count + 1))
else
  frontend_fail_count=0
fi

if ! curl -fsS "${PROD_PUBLIC_BASE_URL}/api/health" >/dev/null; then
  backend_status="failed"
  backend_fail_count=$((backend_fail_count + 1))
else
  backend_fail_count=0
fi

if [[ "${frontend_fail_count}" -ge "${FAILURE_THRESHOLD_RESOLVED}" ]]; then
  recover_frontend="true"
fi

if [[ "${backend_fail_count}" -ge "${FAILURE_THRESHOLD_RESOLVED}" ]]; then
  recover_backend="true"
fi

# Persist the counters and the current decision for the next monitoring build.
printf '%s\n' "${frontend_fail_count}" > "${frontend_fail_file}"
printf '%s\n' "${backend_fail_count}" > "${backend_fail_file}"

cat > "${status_file}" <<EOF
FRONTEND_STATUS=${frontend_status}
BACKEND_STATUS=${backend_status}
FRONTEND_FAIL_COUNT=${frontend_fail_count}
BACKEND_FAIL_COUNT=${backend_fail_count}
RECOVER_FRONTEND=${recover_frontend}
RECOVER_BACKEND=${recover_backend}
EOF

echo "Public frontend status: ${frontend_status} (${frontend_fail_count} consecutive failures)"
echo "Public backend status: ${backend_status} (${backend_fail_count} consecutive failures)"
