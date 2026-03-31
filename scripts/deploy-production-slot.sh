#!/usr/bin/env bash

set -euo pipefail

required_vars=(
  TARGET_SLOT
  PROD_SLOT_HOST
  PROD_SLOT_PATH
  PROD_SSH_USER
  SSH_KEY_FILE
  API_IMAGE
  UI_IMAGE
  APP_BUILD_SHA
  GITHUB_USERNAME
  GITHUB_TOKEN
  PROD_DB_HOST
  PROD_DB_PASSWORD
  PROD_PUBLIC_API_URL
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

case "${TARGET_SLOT}" in
  blue)
    compose_template="infrastructure/app/production-blue/docker-compose.yml"
    ;;
  green)
    compose_template="infrastructure/app/production-green/docker-compose.yml"
    ;;
  *)
    echo "Unsupported TARGET_SLOT: ${TARGET_SLOT}" >&2
    exit 1
    ;;
esac

cp "${compose_template}" "$tmp_dir/docker-compose.yml"

cat > "$tmp_dir/.env" <<EOF
API_IMAGE=${API_IMAGE}
UI_IMAGE=${UI_IMAGE}
API_PORT=${PROD_API_PORT:-3001}
UI_PORT=${PROD_UI_PORT:-5173}
APP_BUILD_SHA=${APP_BUILD_SHA}
VITE_API_URL=${PROD_PUBLIC_API_URL}
DB_HOST=${PROD_DB_HOST}
DB_PORT=${PROD_DB_PORT:-3306}
DB_USER=${PROD_DB_USER:-appuser}
DB_PASSWORD=${PROD_DB_PASSWORD}
DB_NAME=${PROD_DB_NAME:-notes_db}
EOF

ssh_opts=(
  -i "$SSH_KEY_FILE"
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
)

ssh "${ssh_opts[@]}" "${PROD_SSH_USER}@${PROD_SLOT_HOST}" "mkdir -p '${PROD_SLOT_PATH}'"
scp "${ssh_opts[@]}" "$tmp_dir/docker-compose.yml" "$tmp_dir/.env" "${PROD_SSH_USER}@${PROD_SLOT_HOST}:${PROD_SLOT_PATH}/"

ssh "${ssh_opts[@]}" "${PROD_SSH_USER}@${PROD_SLOT_HOST}" bash <<EOF
set -euo pipefail
cd "${PROD_SLOT_PATH}"
echo "${GITHUB_TOKEN}" | sudo docker login ghcr.io -u "${GITHUB_USERNAME}" --password-stdin
sudo docker compose pull
sudo docker compose up -d --remove-orphans
EOF
