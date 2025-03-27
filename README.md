# TravelSidecar

## Description
TravelSidecar is a trip planning application built with .NET 9, Angular 19, and PostgreSQL.

## Project Structure
- **Server:** .NET - [Server Documentation](/server/README.md)
- **Web Client:** Angular - [Web Client Documentation](/web-client/README.md)
- **Database:** Postgres

## Deployment Guide

1 . Download the docker-compose file:

```bash
curl -O https://raw.githubusercontent.com/mfcar/TravelSidecar/main/docker/docker-compose-production.yml
```

2. (Optional) Create a `.env` file to customize deployment:

### Application
 - APP_PORT=8590 
 - APP_HTTPS_PORT=8591
### Database Configuration
 - DB_PORT=55432 
 - DB_PASSWORD=your_password_here
### MinIO configuration (Blob Storage)
 - MINIO_PORT=9000 
 - MINIO_CONSOLE_PORT=9001 
 - MINIO_USER=your_minio_username 
 - MINIO_PASSWORD=your_secure_minio_password

3. Start the application

```bash
docker-compose -f docker-compose.production.yml up -d
``` 

4. Access the application at: http://localhost:8590 and use the default admin credentials to log in.

### Default Admin User

TravelSidecar is pre-configured with a default admin account:

- **Username:** admin
- **Email:** admin@admin.user
- **Password:** Admin@123456
- **Important:** Password change is required on first login

### Persistent Data

All data is stored in Docker volumes:
- Database: `travelsidecar-postgres-data`
- Storage: `travelsidecar-minio-data`

### Upgrading

To upgrade to a new version:
```bash
# Pull the latest image
docker pull travelsidecar/travelsidecar:latest
```

## Quick Start for the Development Environment
The easiest way to run the entire application stack:

```bash
# Clone the repository
git clone https://github.com/mfcar/travelsidecar.git
cd travelsidecar

# Start the application
docker compose -f docker/docker-compose-development.yml up -d

# To stop the application
docker compose -f docker/docker-compose-development.yml down
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

## Development Environment
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