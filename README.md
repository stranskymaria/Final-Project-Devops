# SimpleNotes DevOps Project

This repository contains the infrastructure, CI/CD pipelines, and deployment automation for the SimpleNotes application.

The project implements:

- Pipeline 1: Continuous Integration for pull requests
- Pipeline 2: Automatic deployment to staging
- Pipeline 3: Blue/Green deployment to production
- Optional monitoring and self-healing with Jenkins

## Application Overview

The repository includes:

- `SimpleNotesUI`
  Frontend application
- `SimpleNotesAPI`
  Backend API
- Dockerfiles for both frontend and backend
- Local development Docker Compose setup
- Health endpoint in the backend
- Shared build/version metadata via `app-version.json`

## Infrastructure Overview

The environment is built with Multipass VMs.

| VM | IP | Role |
|---|---|---|
| `jenkins` | `192.168.2.5` | Runs Jenkins and orchestrates CI/CD |
| `staging` | `192.168.2.6` | Runs the staging frontend and backend |
| `staging-db` | `192.168.2.7` | Runs the staging MySQL database |
| `prod-blue` | `192.168.2.8` | Blue production slot |
| `prod-green` | `192.168.2.9` | Green production slot |
| `db` | `192.168.2.10` | Production MySQL database |
| `nginx` | `192.168.2.11` | Reverse proxy and blue/green traffic switch |

## Environment URLs

| Environment | UI URL | API Docs URL | Health URL |
|---|---|---|---|
| Staging | `http://192.168.2.6:5173/` | `http://192.168.2.6:3001/api-docs/` | `http://192.168.2.6:3001/api/health` |
| Production | `http://192.168.2.11/` | `http://192.168.2.11/api-docs/` | `http://192.168.2.11/api/health` |
| Prod Blue | `http://192.168.2.8:5173/` | `http://192.168.2.8:3001/api-docs/` | `http://192.168.2.8:3001/api/health` |
| Prod Green | `http://192.168.2.9:5173/` | `http://192.168.2.9:3001/api-docs/` | `http://192.168.2.9:3001/api/health` |

## Jenkins Pipelines

The Jenkins setup is split into separate jobs and separate pipeline files:

- [Jenkinsfile.ci](/Users/mariastransky/Documents/Proiect%20Devops/Jenkinsfile.ci)
  Pipeline 1 for PR validation
- [Jenkinsfile.staging](/Users/mariastransky/Documents/Proiect%20Devops/Jenkinsfile.staging)
  Pipeline 2 for staging deployment
- [Jenkinsfile.production](/Users/mariastransky/Documents/Proiect%20Devops/Jenkinsfile.production)
  Pipeline 3 for blue/green production deployment
- [Jenkinsfile.monitoring](/Users/mariastransky/Documents/Proiect%20Devops/Jenkinsfile.monitoring)
  Optional monitoring and self-healing pipeline

### Pipeline 1: CI

Trigger:

- Pull Request from `development` to `main` or `release`

Main flow:

- install backend and frontend dependencies
- run backend lint
- run backend unit tests
- run frontend lint
- run frontend tests
- comment on the PR if the build fails

### Pipeline 2: Staging

Trigger:

- commit or merge to `main`

Main flow:

- build backend and frontend Docker images
- tag images with commit SHA
- push images to GitHub Container Registry
- deploy to the staging VM
- run live integration tests against the staging environment

### Pipeline 3: Production

Trigger:

- manual run from Jenkins using the `release` branch

Main flow:

- detect the live production slot from Nginx
- select the idle slot
- create a production DB backup before deploy
- deploy the new version to the idle slot
- run pre-switch validation tests
- switch traffic through Nginx
- monitor the public health endpoint after switch
- automatically roll back if post-switch monitoring fails

### Release Promotion Flow

The current promotion flow is:

1. develop changes on `development`
2. open a Pull Request from `development` to `main`
3. run Pipeline 1
4. merge into `main`
5. run Pipeline 2 and validate the version in staging
6. open a Pull Request from `main` to `release`
7. merge into `release`
8. run Pipeline 3 manually from `release` to deploy to production

This keeps:

- `main` as the integration and staging branch
- `release` as the branch used for production promotion

### Monitoring and Self-Healing

Trigger:

- scheduled automatically every minute by Jenkins cron

Main flow:

- check production frontend health
- check production backend health
- track consecutive failures separately for UI and API
- trigger auto-recovery when the configured threshold is reached

## Production Database Backup

Pipeline 3 creates a MySQL backup before production deployment.

Backup characteristics:

- generated with `mysqldump`
- stored on the production DB VM
- saved in `/home/ubuntu/simplenotes-db-backups`
- file name contains timestamp and build SHA
- only the latest 5 backups are kept

## Repository Structure

- `SimpleNotesAPI/`
  Backend source code
- `SimpleNotesUI/`
  Frontend source code
- `infrastructure/app/`
  Application deployment templates for staging and production slots
- `infrastructure/db/`
  Database deployment templates for staging and production
- `scripts/`
  Automation scripts used by Jenkins and VM provisioning

## Additional Documentation

- [PIPELINES.md](/Users/mariastransky/Documents/Proiect%20Devops/PIPELINES.md)
  Dedicated overview of Jenkins jobs and the promotion flow
- [PROJECT_PLAN.md](/Users/mariastransky/Documents/Proiect%20Devops/PROJECT_PLAN.md)
  High-level project plan
- [infrastructure/app/README.md](/Users/mariastransky/Documents/Proiect%20Devops/infrastructure/app/README.md)
  Application deployment templates and environment details
- [infrastructure/db/README.md](/Users/mariastransky/Documents/Proiect%20Devops/infrastructure/db/README.md)
  Database deployment templates, persistence, and backup notes
- [ENVIRONMENTS.md](/Users/mariastransky/Documents/Proiect%20Devops/ENVIRONMENTS.md)
  VM IP inventory

## Security Notes

- Real `.env` files are not kept in Git.
- Only `.env.example` files are tracked.
- Jenkins credentials are used for:
  - GitHub access
  - GHCR login
  - SSH deployment
  - staging and production database passwords
