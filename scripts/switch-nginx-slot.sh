#!/usr/bin/env bash

set -euo pipefail

required_vars=(
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

deploy_slot="${TARGET_DEPLOY_SLOT:-${TARGET_SLOT:-}}"

if [[ -z "${deploy_slot}" ]]; then
  echo "Missing required environment variable: TARGET_DEPLOY_SLOT or TARGET_SLOT" >&2
  exit 1
fi

case "${deploy_slot}" in
  blue|green)
    ;;
  *)
    echo "Unsupported deployment slot: ${deploy_slot}" >&2
    exit 1
    ;;
esac

ssh_opts=(
  -i "$SSH_KEY_FILE"
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
)

case "${deploy_slot}" in
  blue)
    ui_upstream="http://192.168.2.8:5173"
    api_upstream="http://192.168.2.8:3001"
    ;;
  green)
    ui_upstream="http://192.168.2.9:5173"
    api_upstream="http://192.168.2.9:3001"
    ;;
esac

upstream_dir="/etc/nginx/simplenotes"
upstream_file="${upstream_dir}/active-upstream.conf"
tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT

cat > "$tmp_file" <<EOF
set \$simplenotes_upstream ${ui_upstream};
set \$simplenotes_api_upstream ${api_upstream};
EOF

scp "${ssh_opts[@]}" "$tmp_file" "${PROD_SSH_USER}@${NGINX_HOST}:/tmp/simplenotes-active-upstream.conf"

ssh "${ssh_opts[@]}" "${PROD_SSH_USER}@${NGINX_HOST}" bash <<EOF
set -euo pipefail
sudo mkdir -p "${upstream_dir}"
sudo mv /tmp/simplenotes-active-upstream.conf "${upstream_file}"
sudo nginx -t
sudo systemctl reload nginx
EOF
