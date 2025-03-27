# TravelSidecar

<div align="center">

[![License](https://img.shields.io/github/license/mfcar/travelsidecar)](LICENSE)
[![Docker Pulls](https://img.shields.io/docker/pulls/travelsidecar/travelsidecar)](https://hub.docker.com/r/travelsidecar/travelsidecar)
[![Release](https://img.shields.io/github/v/release/mfcar/travelsidecar)](https://github.com/mfcar/travelsidecar/releases)

</div>

## Overview
TravelSidecar is a trip planning application built with .NET 9, Angular 19, and PostgreSQL.

## Quick Start
```bash
# Download docker-compose file
curl -O https://raw.githubusercontent.com/mfcar/TravelSidecar/main/docker/docker-compose.production.yml

# Start the application
docker-compose -f docker-compose.production.yml up -d
```

Access at: http://localhost:8590 with default admin credentials:
- **Username:** admin
- **Password:** Admin@123456

## Configuration
Create a `.env` file to customize your deployment:

```properties
# Application
APP_PORT=8590
APP_HTTPS_PORT=8591

# Database
DB_PORT=55432
DB_PASSWORD=your_password_here

# Blog Storage (MinIO)
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_USER=your_minio_username
MINIO_PASSWORD=your_secure_minio_password
```

## For Developers
View detailed documentation:
- [Server (.NET)](/server/README.md)
- [Web Client (Angular)](/web-client/README.md)

### Development Environment
```bash
# Clone the repository
git clone https://github.com/mfcar/travelsidecar.git
cd travelsidecar

# Start development environment
docker compose -f docker/docker-compose.development.yml up -d
```

## Accessing the Application
After starting the Docker containers:

- **Web Interface:** `http://localhost:3590`
- **API:** `http://localhost:3590/api`

## Security Information

### Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default:** 100 requests per minute per user/IP
- **Authentication operations:** 10 requests per minute
- **Read operations:** 150 requests per minute
- **Admin operations:** 20 requests per minute

Exceeding these limits will result in HTTP 429 (Too Many Requests) responses.

## Basic Configuration
The application uses the following default settings, which can be modified in `docker-compose-development.yml`:

- **Database Name:** travelsidecar
- **Database User:** travelsidecaru
- **Database Password:** travelsidecarpw

## Local Development
For local development, you can run components separately:

### Backend (.NET)

```bash
cd server/Api
dotnet run
```

Access at `https://localhost:733`

### Frontend (Angular)

```bash
cd web-client
npm install
npm start
```

Access at `http://localhost:5300`

The frontend is configured to proxy API requests to the backend automatically.

## Docker Container Information

- **Web Application:** Exposes ports 3590 (HTTP) and 3591 (HTTPS)
- **PostgreSQL Database:** Exposes port 55432

## Health Check Endpoints

TravelSidecar implements standard health check endpoints for monitoring application status:

- **Liveness (`/health/live`)**: Confirms that the application is running and responsive
- **Readiness (`/health/ready`)**: Verifies that the application and its dependencies (Postgre database) are ready to accept traffic
- **Resource Monitoring (`/health/resources`)**: Provides memory usage metrics and status

Health checks are configured with the following thresholds:
- **Warning level:** 768MB of memory usage
- **Critical level:** 896MB of memory usage