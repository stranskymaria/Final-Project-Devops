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

ssh_opts=(
  -i "$SSH_KEY_FILE"
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
)

active_config="$(
  ssh "${ssh_opts[@]}" "${PROD_SSH_USER}@${NGINX_HOST}" \
    "sudo cat /etc/nginx/simplenotes/active-upstream.conf"
)"

case "$active_config" in
  *192.168.2.8*)
    printf 'blue\n'
    ;;
  *192.168.2.9*)
    printf 'green\n'
    ;;
  *)
    echo "Could not detect the live slot from Nginx active upstream config." >&2
    exit 1
    ;;
esac
