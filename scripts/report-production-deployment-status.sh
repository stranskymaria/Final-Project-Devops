#!/usr/bin/env bash

set -euo pipefail

# Publish a commit status back to GitHub so the production deployment result is visible there too.
required_vars=(
  GITHUB_TOKEN
  GITHUB_REPOSITORY
  GIT_COMMIT_SHA
  STATUS_STATE
  STATUS_DESCRIPTION
  BUILD_URL
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

payload="$(mktemp)"
trap 'rm -f "$payload"' EXIT

# Build the GitHub Statuses API payload with a link back to the Jenkins build.
cat > "$payload" <<EOF
{
  "state": "${STATUS_STATE}",
  "target_url": "${BUILD_URL}",
  "description": "${STATUS_DESCRIPTION}",
  "context": "simplenotes/pipeline-3-production"
}
EOF

curl -fsS \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -X POST \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/statuses/${GIT_COMMIT_SHA}" \
  -d @"${payload}" \
  >/dev/null
