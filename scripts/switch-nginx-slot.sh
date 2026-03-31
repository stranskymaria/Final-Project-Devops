#!/usr/bin/env bash

set -euo pipefail

required_vars=(
  TARGET_SLOT
  NGINX_HOST
  PROD_SSH_USER
  SSH_KEY_FILE
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

case "${TARGET_SLOT}" in
  blue|green)
    ;;
  *)
    echo "Unsupported TARGET_SLOT: ${TARGET_SLOT}" >&2
    exit 1
    ;;
esac

ssh_opts=(
  -i "$SSH_KEY_FILE"
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
)

upstream_file="/etc/nginx/conf.d/simplenotes-active-upstream.conf"
tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT

cat > "$tmp_file" <<EOF
set \$simplenotes_upstream http://prod-${TARGET_SLOT}:5173;
set \$simplenotes_api_upstream http://prod-${TARGET_SLOT}:3001;
EOF

scp "${ssh_opts[@]}" "$tmp_file" "${PROD_SSH_USER}@${NGINX_HOST}:/tmp/simplenotes-active-upstream.conf"

ssh "${ssh_opts[@]}" "${PROD_SSH_USER}@${NGINX_HOST}" bash <<EOF
set -euo pipefail
sudo mv /tmp/simplenotes-active-upstream.conf "${upstream_file}"
sudo nginx -t
sudo systemctl reload nginx
EOF
