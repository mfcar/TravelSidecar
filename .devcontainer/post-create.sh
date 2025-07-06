#!/bin/bash
set -e

echo "🚀 Starting post-create setup..."

# Navigate to workspace
cd /workspace

# Restore .NET dependencies
echo "📦 Restoring .NET dependencies..."
cd server
dotnet restore
cd ..

# Install Angular dependencies
echo "📦 Installing Angular dependencies..."
cd web-client
npm install
cd ..

# Run database migrations
echo "🗄️ Running database migrations..."
cd server/Api
dotnet ef database update
cd ../..

# Create MinIO bucket (backup in case the createbuckets service didn't work)
echo "🪣 Ensuring MinIO bucket exists..."
mc alias set local http://localhost:9000 minio minio123 || true
mc mb --ignore-existing local/travelsidecar-dev || true

# Set up git
echo "🔧 Configuring git..."
git config --global --add safe.directory /workspace

# Display helpful information
echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📋 Quick commands:"
echo "  Backend:  cd server && dotnet run --project Api"
echo "  Frontend: cd web-client && npm start"
echo ""
echo "🌐 Service URLs:"
echo "  Angular:         http://localhost:4200"
echo "  .NET API:        http://localhost:5300"
echo "  MinIO Console:   http://localhost:9001 (login: minio/minio123)"
echo "  PostgreSQL:      localhost:55000 (user: travelsidecaru, password: travelsidecarpw)"
echo ""