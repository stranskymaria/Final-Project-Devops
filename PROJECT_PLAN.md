# Project Plan

## Goal

Build a fully automated CI/CD lifecycle for a 3-tier web application using this repository.

The final system should support:

- Continuous Integration for pull requests
- Automatic deployment to staging
- Blue/Green deployment to production
- Optional monitoring and self-healing

## Current Repository Status

This repository already includes:

- A frontend application in `SimpleNotesUI`
- A backend API in `SimpleNotesAPI`
- Dockerfiles for frontend and backend
- A `docker-compose.yml` for local development
- Backend tests
- Frontend tests
- Shared versioning via `app-version.json`
- Footer version/build metadata in the UI
- Health endpoint in the API

This means the application itself already exists, and the main remaining work is infrastructure and automation.

## Recommended Architecture

Use Multipass virtual machines with the following roles:

- `jenkins`
  Runs Jenkins and orchestrates the pipelines

- `staging`
  Runs the staging frontend and backend containers

- `staging-db`
  Runs the staging MySQL database

- `prod-blue`
  Runs the production application in the blue slot

- `prod-green`
  Runs the production application in the green slot

- `db`
  Runs the production MySQL database

- `nginx`
  Acts as reverse proxy and traffic switch for blue/green deployments

## Important Design Decision

For production, use one shared production database VM and two application slots.

Why:

- It is simpler than maintaining two production databases
- It is easier to explain in the final presentation
- It matches a common blue/green approach at application level
- Database migrations can be handled during deployment instead of duplicating the DB layer

So:

- Blue/Green applies to the app tier
- The database remains shared

## Phase 1: VM Provisioning

### Objective

Create all required VMs with Multipass.

### Status

Already started with:

- `scripts/create-vms.sh`

### Manual check

Run:

```bash
./scripts/create-vms.sh
multipass list
```

### Expected result

You should see all required VMs listed and running.

## Phase 2: Base VM Bootstrap

### Objective

Prepare each Ubuntu VM with the basic tools needed for the project.

### What to install

- `curl`
- `git`
- `docker`
- `docker compose`
- useful utilities like `vim`, `nano`, `unzip`

### Notes

- Docker is needed on `staging`, `staging-db`, `prod-blue`, `prod-green`, and `db`
- Jenkins will be installed separately on the `jenkins` VM
- Nginx will be installed separately on the `nginx` VM

### Deliverable

A reusable bootstrap script for Ubuntu VMs.

## Phase 3: Network and Access Preparation

### Objective

Make sure Jenkins can connect to the other VMs and deploy to them.

### Tasks

- obtain each VM IP with `multipass info <vm-name>`
- define a simple inventory list
- configure SSH access from your machine and from Jenkins
- test connectivity between machines

### Deliverable

A documented inventory and confirmed SSH connectivity.

## Phase 4: Staging Environment

### Objective

Deploy the app manually to staging first, before automating it.

### Staging layout

- `staging`: frontend + backend containers
- `staging-db`: MySQL

### Tasks

- prepare environment files on the VMs
- run backend and frontend containers
- point frontend to backend
- connect backend to MySQL
- verify:
  - frontend loads
  - backend health endpoint responds
  - notes CRUD works

### Why this step matters

Automation is much easier once the manual deployment path is already proven.

## Phase 5: Continuous Integration Pipeline

### Objective

Implement Pipeline 1.

### Trigger

Pull Request from `development` to `main` or `release`

### Required jobs

- lint frontend
- lint backend
- run frontend tests
- run backend tests

### Expected behavior

- if checks pass, PR can be merged
- if checks fail, PR should clearly show failure

### Deliverable

A Jenkins pipeline file for CI.

## Phase 6: Staging Deployment Pipeline

### Objective

Implement Pipeline 2.

### Trigger

Merge or commit to `main`

### Required flow

1. Sync version/build metadata
2. Build frontend and backend Docker images
3. Tag images with commit SHA or build number
4. Push images to GitHub Packages
5. Pull images on staging
6. Deploy to staging VMs
7. Run live tests against staging

### Tests to run after deploy

- backend health endpoint
- API notes flow
- UI availability

### Deliverable

A Jenkins pipeline for staging deployment.

## Phase 7: Production Blue/Green Deployment

### Objective

Implement Pipeline 3.

### Trigger

Manual approval from Jenkins using the `release` branch

### Production layout

- `prod-blue`: app slot blue
- `prod-green`: app slot green
- `db`: production MySQL
- `nginx`: public entrypoint and traffic switch

### Required flow

1. Detect which slot is live
2. Select the idle slot
3. Create a production DB backup before deployment
4. Pull latest frontend/backend images
5. Deploy app to the idle slot
6. Run health checks and integration tests on the idle slot before switching traffic
7. Update Nginx to point traffic to the idle slot
8. Monitor health after the switch
9. Roll back automatically if unhealthy

### Pre-switch validation tests

- backend health endpoint
- notes API flow
- frontend homepage

### Rollback strategy

- restore Nginx upstream to previous slot
- keep previous app slot intact during switch
- keep the database backup available before deployment

### Promotion Model

Recommended promotion flow:

1. `development` -> `main`
2. CI validation on the PR
3. automatic deployment to staging from `main`
4. validation in staging
5. `main` -> `release`
6. manual production deployment from `release`

## Phase 8: Nginx Blue/Green Switching

### Objective

Use Nginx as the production traffic switch.

### Tasks

- define upstream for blue slot
- define upstream for green slot
- create one active route
- allow Jenkins script to swap active upstream
- reload Nginx safely

### Deliverable

Nginx configuration and switch script.

## Phase 9: Build Metadata and Versioning

### Objective

Keep versioning understandable across environments.

### Strategy

- manual release version in `app-version.json`
- automatic `APP_BUILD_SHA` for staging deploys
- optional `APP_DEPLOY_COLOR` for blue/green production slot visibility

### Current support already in repo

- UI footer shows version and deployment color
- API health endpoint shows build version

## Phase 10: Optional Monitoring and Self-Healing

### Objective

Implement basic health monitoring.

### Suggested approach

- poll health endpoints every minute
- count consecutive failures
- re-provision the affected container if threshold is reached

### Good candidates

- Jenkins scheduled job
- simple shell script
- Prometheus + Grafana if time allows

## Suggested Order of Implementation

Follow this order:

1. Create VMs
2. Install base dependencies
3. Set up staging manually
4. Add linting
5. Add CI pipeline
6. Add image build and registry push
7. Automate staging deployment
8. Set up production blue/green manually
9. Automate blue/green deployment
10. Add rollback logic
11. Add optional monitoring

## Immediate Next Steps

These are the best next tasks:

1. Create a VM bootstrap script
2. Create a Docker installation script
3. Create a Jenkins installation script
4. Document VM IPs and roles
5. Deploy staging manually

## Beginner Tips

- Do not automate production before staging works manually
- Test each VM role separately
- Keep one change small and verifiable
- Save commands you use successfully
- Prefer simple scripts over clever automation at the beginning

## Success Criteria

The project is complete when you can demonstrate:

- a PR triggers lint/tests
- a merge deploys automatically to staging
- a manual Jenkins action deploys to blue or green
- Nginx switches traffic
- a failed deployment can roll back
- production DB backup is created before deploy
- monitoring can detect failures and trigger auto-recovery

## Expected Repository Additions Later

You will likely add:

- Jenkinsfiles
- deployment scripts
- Nginx configs
- VM bootstrap scripts
- environment templates
- documentation for final presentation
