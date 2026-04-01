# Database Infrastructure

This folder contains the Docker Compose templates used for the MySQL database VMs:

- `staging-db`
- `db` (production database)

## Purpose

- `staging/`
  Used to run the staging MySQL instance.
- `production/`
  Used to run the production MySQL instance.

Both environments use MySQL 8 and initialize the schema from `init.sql`.

## Files

- `staging/docker-compose.yml`
- `staging/.env.example`
- `staging/init.sql`
- `production/docker-compose.yml`
- `production/.env.example`
- `production/init.sql`

## Persistent Storage

Both database environments use persistent Docker volumes mounted to:

```txt
/var/lib/mysql
```

This means the database data survives:

- container restart
- container recreation
- `docker compose down` without `-v`

The data is lost only if the volume is explicitly removed.

## Current Environment Mapping

### Staging Database

- VM: `192.168.2.7`
- compose folder target: chosen on the VM during deployment
- exposed MySQL port: `3306`
- application client: staging app on `192.168.2.6`

### Production Database

- VM: `192.168.2.10`
- backup folder: `/home/ubuntu/simplenotes-db-backups`
- exposed MySQL port: `3306`
- application clients:
  - `prod-blue` on `192.168.2.8`
  - `prod-green` on `192.168.2.9`

## Environment Variables

Each database environment expects:

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_PORT`

Only `.env.example` files are tracked in Git. Real `.env` files should be created on the target VM.

## Initialization

On first startup, MySQL loads:

- `staging/init.sql`
- `production/init.sql`

depending on the environment.

This is used to prepare the initial schema/data required by the application.

## Manual Usage

To start one of the database environments manually:

1. copy the correct files to the target VM
2. create `.env` from `.env.example`
3. run:

```bash
docker compose up -d
```

To inspect the running container:

```bash
docker ps
docker logs <container-name>
```

## Backup in Pipeline 3

Production deployments now include a backup step before deploying the new version.

The backup is:

- executed with `mysqldump`
- saved on the production DB VM
- stored in `/home/ubuntu/simplenotes-db-backups`
- named with timestamp and build SHA
- pruned automatically so that only the latest 5 backups are kept

Example backup file name:

```txt
notes_db_2026-04-01_01-37-33_6937b64.sql
```

## Notes

- Do not commit real `.env` files with passwords.
- Keep production and staging passwords in Jenkins credentials or on the target VMs.
- The app pipelines connect to these database VMs through the IPs defined in the deployment pipelines.
