# Pipelines

## Overview

The project uses four Jenkins jobs with clearly separated responsibilities:

- `simplenotes-pipeline-1-ci`
- `simplenotes-pipeline-2-staging`
- `simplenotes-pipeline-3-production`
- `simplenotes-monitoring-self-healing`

This separation keeps the CI/CD flow easier to explain, maintain, and troubleshoot.

## Promotion Flow

The current promotion flow is:

```text
development -> main -> staging -> release -> production
```

In practice:

1. Changes are developed on `development` or feature branches.
2. A pull request is opened toward `main`.
3. Pipeline 1 validates the pull request.
4. After merge into `main`, Pipeline 2 builds, pushes, and deploys to staging.
5. Once the staging version is accepted, a promotion pull request is opened from `main` to `release`.
6. Production is deployed manually from `release` through Pipeline 3.

## Pipeline 1: CI

- Jenkinsfile: [Jenkinsfile.ci](./Jenkinsfile.ci)
- Jenkins job: `simplenotes-pipeline-1-ci`
- Trigger: pull requests targeting `main` or `release`

Main responsibilities:

- install backend and frontend dependencies
- run backend lint
- run backend unit tests
- run frontend lint
- run frontend tests
- post a GitHub comment on PR failure

This pipeline answers the question: "Is the proposed code change valid enough to continue?"

## Pipeline 2: Staging

- Jenkinsfile: [Jenkinsfile.staging](./Jenkinsfile.staging)
- Jenkins job: `simplenotes-pipeline-2-staging`
- Trigger: branch builds on `main` or `release`

Main responsibilities:

- prepare build metadata from the current commit
- build Docker images for API and UI
- push images to GitHub Container Registry
- deploy the selected version to the staging VM
- run live staging integration tests
- comment on the commit when deployment fails

This pipeline answers the question: "Can this integrated version be deployed and validated in staging?"

## Pipeline 3: Production

- Jenkinsfile: [Jenkinsfile.production](./Jenkinsfile.production)
- Jenkins job: `simplenotes-pipeline-3-production`
- Trigger: manual Jenkins run from the `release` branch

Main responsibilities:

- detect the live production slot from Nginx
- select the idle slot for deployment
- create a production database backup before deploy
- deploy the new version to the idle slot
- run pre-switch validation tests on the new slot
- switch production traffic through Nginx
- monitor the public production health endpoint after switch
- rollback traffic automatically if post-switch monitoring fails
- report deployment success or failure back to GitHub

This pipeline answers the question: "Can the validated release be promoted safely to production?"

## Monitoring And Self-Healing

- Jenkinsfile: [Jenkinsfile.monitoring](./Jenkinsfile.monitoring)
- Jenkins job: `simplenotes-monitoring-self-healing`
- Trigger: scheduled automatically every minute

Main responsibilities:

- detect the live production slot
- poll the public frontend endpoint
- poll the public backend health endpoint
- track consecutive frontend and backend failures
- recreate the affected live service when the configured threshold is reached

This job provides a lightweight monitoring loop implemented with Jenkins instead of a dedicated observability stack.

## Why Separate Pipelines

The project intentionally uses separate Jenkins jobs instead of one combined pipeline.

Benefits:

- each stage of the delivery process is easier to present
- failures are easier to localize
- production remains manual and controlled
- monitoring stays independent from build and deployment logic

## Quick Summary

- Pipeline 1 validates pull requests.
- Pipeline 2 deploys accepted code to staging and validates it there.
- Pipeline 3 promotes an approved release to production with blue/green deployment.
- The monitoring job performs periodic health checks and basic self-healing.
