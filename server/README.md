# Journey Grid - Server

## Requirements
- .NET 9 SDK
- PostGIS 3.5 (PostgreSQL 17.2)

## Getting Started

### Prerequisites
Ensure you have the following installed on your machine:
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Docker](https://www.docker.com/get-started)

### Database Setup

#### Running PostGIS in Docker
To run PostGIS locally using Docker, execute the following command:
```bash
docker run -p 55000:5432 --name postgis-local -e POSTGRES_PASSWORD=journeygridpw -e POSTGRES_USER=journeygridu -d postgis/postgis:17-3.5
```

### Migrations
#### Generate Migration
To create a new migration, use the following command:
```bash
dotnet ef migrations add <Migration Name> --startup-project Api -o Data/Migrations
```

### Update Database

> [!TIP]
> The application will apply the migrations automatically when it starts up.

To apply the latest migrations to the database manually, run:
```bash
dotnet ef database update --startup-project Api
```

