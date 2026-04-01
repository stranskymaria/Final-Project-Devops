#!/usr/bin/env bash

set -euo pipefail

required_vars=(
  STAGING_HOST
  STAGING_PATH
  SSH_KEY_FILE
  STAGING_SSH_USER
  API_IMAGE
  UI_IMAGE
  APP_BUILD_SHA
  GITHUB_USERNAME
  GITHUB_TOKEN
  STAGING_DB_HOST
  STAGING_DB_PASSWORD
  STAGING_VITE_API_URL
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

cp infrastructure/app/staging/docker-compose.yml "$tmp_dir/docker-compose.yml"

cat > "$tmp_dir/.env" <<EOF
API_IMAGE=${API_IMAGE}
UI_IMAGE=${UI_IMAGE}
API_PORT=${STAGING_API_PORT:-3001}
UI_PORT=${STAGING_UI_PORT:-5173}
APP_BUILD_SHA=${APP_BUILD_SHA}
APP_DEPLOY_COLOR=staging
VITE_API_URL=${STAGING_VITE_API_URL}
DB_HOST=${STAGING_DB_HOST}
DB_PORT=${STAGING_DB_PORT:-3306}
DB_USER=${STAGING_DB_USER:-appuser}
DB_PASSWORD=${STAGING_DB_PASSWORD}
DB_NAME=${STAGING_DB_NAME:-notes_db}
TEST_DB_HOST=${STAGING_DB_HOST}
TEST_DB_PORT=${STAGING_DB_PORT:-3306}
TEST_DB_USER=${STAGING_DB_USER:-appuser}
TEST_DB_PASSWORD=${STAGING_DB_PASSWORD}
TEST_DB_NAME=${STAGING_TEST_DB_NAME:-notes_db_test}
EOF

ssh_opts=(
  -i "$SSH_KEY_FILE"
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
)

ssh "${ssh_opts[@]}" "${STAGING_SSH_USER}@${STAGING_HOST}" "mkdir -p '${STAGING_PATH}'"
scp "${ssh_opts[@]}" "$tmp_dir/docker-compose.yml" "$tmp_dir/.env" "${STAGING_SSH_USER}@${STAGING_HOST}:${STAGING_PATH}/"

ssh "${ssh_opts[@]}" "${STAGING_SSH_USER}@${STAGING_HOST}" bash <<EOF
set -euo pipefail
cd "${STAGING_PATH}"
echo "${GITHUB_TOKEN}" | sudo docker login ghcr.io -u "${GITHUB_USERNAME}" --password-stdin
sudo docker compose pull
sudo docker compose down --remove-orphans || true
sudo docker rm -f simplenotes-staging-api simplenotes-staging-ui 2>/dev/null || true
sleep 2
sudo docker compose up -d --force-recreate --remove-orphans
EOF
