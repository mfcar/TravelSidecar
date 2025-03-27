# TravelSidecar

## Description
TravelSidecar is a trip planning application built with .NET 9, Angular 19, and PostgreSQL.

## Project Structure
- **Server:** .NET - [Server Documentation](/server/README.md)
- **Web Client:** Angular - [Web Client Documentation](/web-client/README.md)
- **Database:** Postgres

## Quick Start with Docker Compose
The easiest way to run the entire application stack:

```bash
# Clone the repository
git clone https://github.com/mfcar/travelsidecar.git
cd travelsidecar

# Start the application
docker compose -f docker/docker-compose.yml up -d

# To stop the application
docker compose -f docker/docker-compose.yml down
```

## Accessing the Application
After starting the Docker containers:

- **Web Interface:** `http://localhost:3590`
- **API:** `http://localhost:3590/api`

## Security Information

### Default Admin User

TravelSidecar is pre-configured with a default admin account:

- **Username:** admin
- **Email:** admin@admin.user
- **Password:** Admin@123456
- **Important:** Password change is required on first login

### Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default:** 100 requests per minute per user/IP
- **Authentication operations:** 10 requests per minute
- **Read operations:** 150 requests per minute
- **Admin operations:** 20 requests per minute

Exceeding these limits will result in HTTP 429 (Too Many Requests) responses.

## Basic Configuration
The application uses the following default settings, which can be modified in `docker-compose.yml`:

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