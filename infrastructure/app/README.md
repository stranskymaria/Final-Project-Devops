# Application VM Templates

These files are templates for deploying the application to:

- `staging`
- `prod-blue`
- `prod-green`

They are designed for the later CI/CD phases where Jenkins builds Docker images and pushes them to a registry.

That means these templates expect image references, not local source code builds.

## Structure

- `staging/docker-compose.yml`
- `staging/.env.example`
- `production-blue/docker-compose.yml`
- `production-blue/.env.example`
- `production-green/docker-compose.yml`
- `production-green/.env.example`

## Important Notes

### 1. These templates are for later deployment

Do not use them until:

- the VMs are created
- the VMs are bootstrapped
- Docker is installed on the application VMs
- the database VMs are ready

### 2. Images are placeholders

The image names in these templates are intentionally placeholders.

Later, Jenkins should replace them with real images from GitHub Packages, for example:

- `ghcr.io/<username>/simplenotes-api:<tag>`
- `ghcr.io/<username>/simplenotes-ui:<tag>`

### 3. Blue/Green color

The production templates already set:

- `APP_DEPLOY_COLOR=blue`
- `APP_DEPLOY_COLOR=green`

This matches the footer behavior already implemented in the UI.

### 4. Database host

These templates assume:

- staging app connects to `staging-db`
- production app connects to `db`

You will later replace the placeholder hostnames or IPs with real values.

