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
- Notes: Used to run CI, staging deployment, production deployment, and monitoring/self-healing jobs

### Staging

- VM name: `staging`
- Role: staging application server
- Expected software:
  - Docker
- IP: `192.168.2.6`
- Notes: Runs frontend and backend containers for the staging environment

### Staging Database

- VM name: `staging-db`
- Role: staging database server
- Expected software:
  - Docker
  - MySQL
- IP: `192.168.2.7`
- Notes: Hosts both `notes_db` and `notes_db_test` for staging

### Production Blue

- VM name: `prod-blue`
- Role: production blue application slot
- Expected software:
  - Docker
- IP: `192.168.2.8`
- Notes: One of the two production application slots used in blue/green deployment

### Production Green

- VM name: `prod-green`
- Role: production green application slot
- Expected software:
  - Docker
- IP: `192.168.2.9`
- Notes: One of the two production application slots used in blue/green deployment

### Production Database

- VM name: `db`
- Role: production database server
- Expected software:
  - Docker
  - MySQL
- IP: `192.168.2.10`
- Notes: Shared production database used by both blue and green slots; stores DB backups in `/home/ubuntu/simplenotes-db-backups`

### Nginx

- VM name: `nginx`
- Role: reverse proxy and blue/green traffic switch
- Expected software:
  - Nginx
- IP: `192.168.2.11`
- Notes: Routes client traffic to either `prod-blue` or `prod-green` and exposes the public production URL

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

## Environment URLs

### Staging

- Frontend URL: `http://192.168.2.6:5173/`
- API base URL: `http://192.168.2.6:3001/api`
- API Docs URL: `http://192.168.2.6:3001/api-docs/`
- Health endpoint: `http://192.168.2.6:3001/api/health`

### Production

- Public UI URL: `http://192.168.2.11/`
- Public API base URL: `http://192.168.2.11/api`
- Public API Docs URL: `http://192.168.2.11/api-docs/`
- Public health endpoint: `http://192.168.2.11/api/health`
- Blue slot UI URL: `http://192.168.2.8:5173/`
- Blue slot API Docs URL: `http://192.168.2.8:3001/api-docs/`
- Blue slot health endpoint: `http://192.168.2.8:3001/api/health`
- Green slot UI URL: `http://192.168.2.9:5173/`
- Green slot API Docs URL: `http://192.168.2.9:3001/api-docs/`
- Green slot health endpoint: `http://192.168.2.9:3001/api/health`
