#!/usr/bin/env bash

set -euo pipefail

# Install Nginx as the public reverse proxy used for blue/green switching.
echo "Updating package lists..."
sudo apt-get update

echo "Installing Nginx..."
sudo apt-get install -y nginx

echo "Enabling and starting Nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx

echo "Nginx installation completed."
sudo systemctl status nginx --no-pager || true
