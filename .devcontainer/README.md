# TravelSidecar Dev Container

This folder contains the configuration for a complete development environment using VS Code Dev Containers.

## What's Included

- **.NET 9.0 SDK** with Entity Framework Core tools
- **Node.js 20.x** with Angular CLI 19
- **PostgreSQL with PostGIS** extension
- **MinIO** S3-compatible object storage
- **Docker-in-Docker** for running containers inside the dev container
- Pre-configured VS Code extensions for C#, Angular, TypeScript, and more

## Getting Started

1. **Prerequisites**:
   - Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Install [VS Code](https://code.visualstudio.com/)
   - Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Open in Dev Container**:
   - Open this project in VS Code
   - When prompted, click "Reopen in Container" or use the command palette (F1) and select "Dev Containers: Reopen in Container"
   - Wait for the container to build (first time may take several minutes)

3. **Post-Create Setup**:
   - The container will automatically:
     - Restore .NET dependencies
     - Install npm packages
     - Run database migrations
     - Create MinIO bucket

## Available Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Angular Dev Server | http://localhost:4200 | - |
| .NET API (HTTP) | http://localhost:5300 | - |
| .NET API (HTTPS) | http://localhost:5301 | - |
| MinIO Console | http://localhost:9001 | minio / minio123 |
| PostgreSQL | localhost:55000 | travelsidecaru / travelsidecarpw |

## Development Commands

### Backend (.NET)
```bash
# Run the API
cd server
dotnet run --project Api

# Run tests
dotnet test

# Add a migration
cd server/Api
dotnet ef migrations add <MigrationName> -o Data/Migrations

# Update database
dotnet ef database update
```

### Frontend (Angular)
```bash
# Start dev server
cd web-client
npm start

# Build for production
npm run build:prod

# Run tests
npm test
```

## Troubleshooting

### Container fails to start
- Ensure Docker Desktop is running
- Check that ports 4200, 5300, 5301, 55000, 9000, and 9001 are not in use

### Database connection issues
- The PostgreSQL service may take a moment to start
- Check the service is healthy: `docker ps`
- Verify connection settings in `appsettings.json`

### MinIO bucket missing
- Run: `mc alias set local http://localhost:9000 minio minio123`
- Run: `mc mb --ignore-existing local/travelsidecar-dev`

## Customization

- Modify `.devcontainer/devcontainer.json` to add VS Code extensions or settings
- Update `.devcontainer/Dockerfile` to add additional tools
- Edit `.devcontainer/docker-compose.yml` to modify service configurations