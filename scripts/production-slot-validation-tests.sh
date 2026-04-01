#!/usr/bin/env bash

set -euo pipefail

# Validate the newly deployed idle production slot before switching public traffic to it.
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
title="CI production note $(date +%s)"
content="Created by Jenkins production pre-switch validation tests."

# First wait for the idle slot to become healthy.
echo "Waiting for production slot ${deploy_slot} backend health endpoint..."
for attempt in $(seq 1 12); do
  if health_response="$(curl -fsS "${base_url}/api/health")"; then
    echo "Health endpoint is ready: ${health_response}"
    break
  fi

  if [ "$attempt" -eq 12 ]; then
    echo "Production slot ${deploy_slot} backend did not become ready in time." >&2
    exit 1
  fi

  sleep 5
done

# Then run a small end-to-end API flow against the idle slot.
echo "Creating note through production slot ${deploy_slot} API..."
create_response="$(
  curl -fsS \
    -X POST \
    -H 'Content-Type: application/json' \
    -d "{\"title\":\"${title}\",\"content\":\"${content}\"}" \
    "${base_url}/api/notes"
)"
echo "Create response: ${create_response}"

note_id="$(
  node -e "const data = JSON.parse(process.argv[1]); if (!data.id) process.exit(1); process.stdout.write(String(data.id));" \
    "${create_response}"
)"

echo "Fetching created note ${note_id}..."
get_response="$(curl -fsS "${base_url}/api/notes/${note_id}")"
echo "Get response: ${get_response}"
node -e "
  const data = JSON.parse(process.argv[1]);
  if (data.id !== Number(process.argv[2])) process.exit(1);
  if (data.title !== process.argv[3]) process.exit(1);
  if (data.content !== process.argv[4]) process.exit(1);
" "${get_response}" "${note_id}" "${title}" "${content}"

echo "Checking notes list contains created note..."
list_response="$(curl -fsS "${base_url}/api/notes")"
node -e "
  const items = JSON.parse(process.argv[1]);
  if (!Array.isArray(items)) process.exit(1);
  const id = Number(process.argv[2]);
  if (!items.some(item => item.id === id)) process.exit(1);
" "${list_response}" "${note_id}"

echo "Deleting created note ${note_id}..."
curl -fsS -X DELETE "${base_url}/api/notes/${note_id}" >/dev/null

echo "Verifying deleted note is gone..."
delete_check_status="$(
  curl -s -o /dev/null -w '%{http_code}' "${base_url}/api/notes/${note_id}"
)"

if [ "${delete_check_status}" != "404" ]; then
  echo "Expected deleted note to return 404, got ${delete_check_status}." >&2
  exit 1
fi

# Finally confirm that the frontend container also answers before traffic is switched.
echo "Checking production slot ${deploy_slot} UI..."
curl -fsSI "${ui_url}" >/dev/null

echo "Production pre-switch validation tests passed for slot ${deploy_slot}."
