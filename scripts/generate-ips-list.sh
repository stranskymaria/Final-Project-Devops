#!/usr/bin/env bash

set -euo pipefail

if ! command -v multipass >/dev/null 2>&1; then
  echo "Error: Multipass is not installed."
  exit 1
fi

OUTPUT_FILE="ips-list.txt"

VMS=(
  "jenkins"
  "staging"
  "staging-db"
  "prod-blue"
  "prod-green"
  "db"
  "nginx"
)

echo "Generating VM IP list..."
{
  echo "VM IP Inventory"
  echo "Generated on: $(date)"
  echo ""

  for vm in "${VMS[@]}"; do
    if multipass info "$vm" >/dev/null 2>&1; then
      ip=$(multipass info "$vm" | awk '/IPv4/{getline; gsub(/^[[:space:]]+/, "", $0); print $0; exit}')
      echo "$vm : ${ip:-IP not found}"
    else
      echo "$vm : VM not found"
    fi
  done
} > "$OUTPUT_FILE"

echo "IP list saved to $OUTPUT_FILE"
cat "$OUTPUT_FILE"
