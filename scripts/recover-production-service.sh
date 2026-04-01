#!/usr/bin/env bash

set -euo pipefail

required_vars=(
  LIVE_SLOT
  SERVICE_NAME
  PROD_BLUE_HOST
  PROD_GREEN_HOST
  PROD_BLUE_PATH
  PROD_GREEN_PATH
  PROD_SSH_USER
  SSH_KEY_FILE
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

case "${LIVE_SLOT}" in
  blue)
    target_host="${PROD_BLUE_HOST}"
    target_path="${PROD_BLUE_PATH}"
    ;;
  green)
    target_host="${PROD_GREEN_HOST}"
    target_path="${PROD_GREEN_PATH}"
    ;;
  *)
    echo "Unsupported LIVE_SLOT: ${LIVE_SLOT}" >&2
    exit 1
    ;;
esac

case "${SERVICE_NAME}" in
  api|ui)
    ;;
  *)
    echo "Unsupported SERVICE_NAME: ${SERVICE_NAME}" >&2
    exit 1
    ;;
esac

ssh_opts=(
  -i "$SSH_KEY_FILE"
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
)

echo "Re-provisioning ${SERVICE_NAME} on live slot ${LIVE_SLOT} (${target_host})..."

ssh "${ssh_opts[@]}" "${PROD_SSH_USER}@${target_host}" bash <<EOF
set -euo pipefail
cd "${target_path}"
sudo docker compose up -d --force-recreate "${SERVICE_NAME}"
EOF

echo "Recovery command completed for ${SERVICE_NAME} on slot ${LIVE_SLOT}."
