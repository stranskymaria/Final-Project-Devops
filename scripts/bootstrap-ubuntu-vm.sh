#!/usr/bin/env bash

set -euo pipefail

# Prepare a fresh Ubuntu VM with the common tools used across the project.
echo "Updating package lists..."
sudo apt-get update

echo "Upgrading installed packages..."
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "Installing base utilities..."
sudo apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  git \
  gnupg \
  lsb-release \
  software-properties-common \
  unzip \
  nano \
  vim

echo "Bootstrap completed successfully."
