# Environments

## Purpose

This file documents the role of each virtual machine used in the project.

It should be updated after the VMs are created and their IPs are collected.

Use the script below to generate the current IP list:

```bash
./scripts/generate-ips-list.sh
```

## VM Inventory

### Jenkins

- VM name: `jenkins`
- Role: CI/CD server
- Expected software:
  - Jenkins
  - Docker
- IP: `192.168.2.5`
- Notes: Used to run CI, staging deployment, and production deployment pipelines

### Staging

- VM name: `staging`
- Role: staging application server
- Expected software:
  - Docker
- IP: `192.168.2.6`
- Notes: Runs frontend and backend containers for staging

### Staging Database

- VM name: `staging-db`
- Role: staging database server
- Expected software:
  - Docker
  - MySQL
- IP: `192.168.2.7`
- Notes: Hosts the staging database

### Production Blue

- VM name: `prod-blue`
- Role: production blue application slot
- Expected software:
  - Docker
- IP: `192.168.2.8`
- Notes: One of the two production app environments

### Production Green

- VM name: `prod-green`
- Role: production green application slot
- Expected software:
  - Docker
- IP: `192.168.2.9`
- Notes: One of the two production app environments

### Production Database

- VM name: `db`
- Role: production database server
- Expected software:
  - Docker
  - MySQL
- IP: `192.168.2.10`
- Notes: Shared production database used by blue and green app slots

### Nginx

- VM name: `nginx`
- Role: reverse proxy and blue/green traffic switch
- Expected software:
  - Nginx
- IP: `192.168.2.11`
- Notes: Routes client traffic to either `prod-blue` or `prod-green`

## Suggested Update Workflow

After creating the VMs:

1. Run:

```bash
./scripts/generate-ips-list.sh
```

2. Copy the IPs into this file.

3. Add any important notes, such as:

- SSH access details
- installed software
- deployment ports
- environment-specific URLs

## Suggested URLs To Track Later

### Staging

- Frontend URL: `TBD`
- Backend URL: `TBD`
- Health endpoint: `TBD`

### Production

- Public URL: `TBD`
- Blue app URL: `TBD`
- Green app URL: `TBD`
- Health endpoint: `TBD`
