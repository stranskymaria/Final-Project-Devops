#!/usr/bin/env bash

set -euo pipefail

echo "Removing old Docker packages if they exist..."
sudo apt-get remove -y docker docker-engine docker.io containerd runc || true

echo "Updating package lists..."
sudo apt-get update

echo "Installing required packages..."
sudo apt-get install -y \
  ca-certificates \
  curl \
  gnupg

echo "Creating Docker keyring directory..."
sudo install -m 0755 -d /etc/apt/keyrings

echo "Refreshing Docker GPG key..."
tmp_docker_key="$(mktemp)"
trap 'rm -f "$tmp_docker_key"' EXIT
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o "$tmp_docker_key"
gpg --show-keys "$tmp_docker_key" >/dev/null
gpg --dearmor < "$tmp_docker_key" | sudo tee /etc/apt/keyrings/docker.gpg >/dev/null
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "Adding Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

echo "Updating package lists again..."
sudo apt-get update

echo "Installing Docker Engine and Compose plugin..."
sudo apt-get install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

echo "Enabling and starting Docker..."
sudo systemctl enable docker
sudo systemctl start docker

echo "Adding current user to docker group..."
sudo usermod -aG docker "$USER"

echo "Docker installation completed."
echo "You may need to log out and log back in for docker group changes to take effect."
