#!/usr/bin/env bash

set -euo pipefail

# Install Jenkins from the official Debian repository and print the initial admin password.
echo "Updating package lists..."
sudo apt-get update

echo "Installing Java..."
sudo apt-get install -y fontconfig openjdk-21-jre

echo "Adding Jenkins repository key..."
tmp_jenkins_key="$(mktemp)"
trap 'rm -f "$tmp_jenkins_key"' EXIT
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key -o "$tmp_jenkins_key"
gpg --show-keys "$tmp_jenkins_key" >/dev/null
sudo install -d -m 0755 /usr/share/keyrings
sudo cp "$tmp_jenkins_key" /usr/share/keyrings/jenkins-keyring.asc
sudo chmod a+r /usr/share/keyrings/jenkins-keyring.asc

echo "Adding Jenkins repository..."
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list >/dev/null

echo "Updating package lists again..."
sudo apt-get update

echo "Installing Jenkins..."
sudo apt-get install -y jenkins

echo "Enabling and starting Jenkins..."
sudo systemctl enable jenkins
sudo systemctl start jenkins

echo "Jenkins installation completed."
sudo systemctl status jenkins --no-pager || true

if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
  echo ""
  echo "Jenkins initial admin password:"
  sudo cat /var/lib/jenkins/secrets/initialAdminPassword
fi
