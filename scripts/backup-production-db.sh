#!/usr/bin/env bash

set -euo pipefail

required_vars=(
  PROD_DB_HOST
  PROD_DB_BACKUP_PATH
  PROD_SSH_USER
  SSH_KEY_FILE
  PROD_DB_PASSWORD
  PROD_DB_USER
  PROD_DB_NAME
  APP_BUILD_SHA
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

ssh_opts=(
  -i "$SSH_KEY_FILE"
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
)

timestamp="$(date +%Y-%m-%d_%H-%M-%S)"
backup_file="${PROD_DB_BACKUP_PATH}/notes_db_${timestamp}_${APP_BUILD_SHA}.sql"
tmp_backup_file="${backup_file}.tmp"

ssh "${ssh_opts[@]}" "${PROD_SSH_USER}@${PROD_DB_HOST}" bash <<EOF
set -euo pipefail
sudo mkdir -p "${PROD_DB_BACKUP_PATH}"
sudo rm -f "${tmp_backup_file}"
sudo docker exec -e MYSQL_PWD="${PROD_DB_PASSWORD}" simplenotes-prod-mysql \
  mysqldump --no-tablespaces -u "${PROD_DB_USER}" "${PROD_DB_NAME}" \
  | sudo tee "${tmp_backup_file}" >/dev/null
sudo test -s "${tmp_backup_file}"
sudo mv "${tmp_backup_file}" "${backup_file}"
sudo ls -1t "${PROD_DB_BACKUP_PATH}"/notes_db_*.sql 2>/dev/null | tail -n +6 | xargs -r sudo rm -f
EOF

printf '%s\n' "${backup_file}"
