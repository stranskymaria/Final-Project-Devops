# Database VM Templates

These files are templates for the database virtual machines.

They are not meant to be run yet if the DB VMs are not configured.

Use them later when reaching the database setup phase for:

- `staging-db`
- `db`

## Structure

- `staging/docker-compose.yml`
- `staging/.env.example`
- `staging/init.sql`
- `production/docker-compose.yml`
- `production/.env.example`
- `production/init.sql`

## Why These Files Exist Now

They let you prepare the final structure early, while keeping the actual deployment for later.

This makes the project easier to follow because:

- VM creation happens first
- VM bootstrap happens second
- Docker installation happens third
- database deployment happens when the DB VMs are ready

## Persistent Storage

Both templates use a named Docker volume mounted to:

```txt
/var/lib/mysql
```

This means the MySQL data persists across normal container restarts and rebuilds.

## Suggested Usage Later

### On `staging-db`

1. Copy the `staging` folder contents to the VM
2. Create a real `.env` from `.env.example`
3. Run:

```bash
docker compose up -d
```

### On `db`

1. Copy the `production` folder contents to the VM
2. Create a real `.env` from `.env.example`
3. Run:

```bash
docker compose up -d
```
