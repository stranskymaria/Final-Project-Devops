#!/usr/bin/env bash

set -euo pipefail

echo "Checking if Multipass is installed..."
if ! command -v multipass >/dev/null 2>&1; then
  echo "Error: Multipass is not installed."
  exit 1
fi

create_vm() {
  local name="$1"
  local cpus="$2"
  local memory="$3"
  local disk="$4"

  if multipass info "$name" >/dev/null 2>&1; then
    echo "VM '$name' already exists. Skipping."
    return
  fi

  echo "Creating VM '$name'..."
  multipass launch --name "$name" --cpus "$cpus" --memory "$memory" --disk "$disk"
  echo "VM '$name' created."
}

create_vm "jenkins" "2" "4G" "20G"
create_vm "staging" "2" "2G" "15G"
create_vm "staging-db" "2" "2G" "15G"
create_vm "prod-blue" "2" "2G" "15G"
create_vm "prod-green" "2" "2G" "15G"
create_vm "db" "2" "2G" "15G"
create_vm "nginx" "1" "1G" "10G"

echo ""
echo "All VMs processed."
multipass list
