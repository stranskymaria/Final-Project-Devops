#!/usr/bin/env bash

set -euo pipefail

base_url="${STAGING_BASE_URL:-http://192.168.2.6:3001}"
ui_url="${STAGING_UI_URL:-http://192.168.2.6:5173}"
title="CI staging note $(date +%s)"
content="Created by Jenkins staging integration tests."

echo "Waiting for backend health endpoint..."
for attempt in $(seq 1 12); do
  if health_response="$(curl -fsS "${base_url}/api/health")"; then
    echo "Health endpoint is ready: ${health_response}"
    break
  fi

  if [ "$attempt" -eq 12 ]; then
    echo "Backend health endpoint did not become ready in time." >&2
    exit 1
  fi

  sleep 5
done

echo "Creating note through staging API..."
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

echo "Checking staging UI..."
curl -fsSI "${ui_url}" >/dev/null

echo "Staging integration tests passed."
