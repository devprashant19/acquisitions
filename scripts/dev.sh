#!/bin/bash

# Development startup script for Acquisition App with Neon Local
# This script starts the application in development mode with Neon Local

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "   Please copy .env.development from the template and update with your Neon credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

# Create .neon_local directory if it doesn't exist
mkdir -p .neon_local

# Add .neon_local to .gitignore if not already present
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "✅ Added .neon_local/ to .gitignore"
fi

echo "📦 Building and starting development containers..."
echo "   - Neon Local proxy will create an ephemeral database branch"
echo "   - Application will run with hot reload enabled"
echo ""

# Start neon-local first in detached mode so the database is running for migrations
docker-compose -f docker-compose.dev.yml up -d neon-local

# Wait for the database to be ready
echo "⏳ Waiting for the database to be ready..."
# We loop until the database responds to a simple query
until docker-compose -f docker-compose.dev.yml exec -T neon-local psql -U postgres -d postgres -c '\q' >/dev/null 2>&1; do
    sleep 1
done

# Start the application container in detached mode
docker-compose -f docker-compose.dev.yml up -d --build app

# Run migrations with Drizzle inside the app container so it can resolve the "neon-local" host
echo "📜 Applying latest schema with Drizzle..."
docker-compose -f docker-compose.dev.yml exec -T app npm run db:migrate

echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:8080"
echo "   Database: postgres://postgres:postgres@localhost:5432/postgres"
echo ""
echo "To stop the environment, press Ctrl+C or run: docker-compose -f docker-compose.dev.yml down"
echo ""

# Attach to the app logs so the developer sees the output
docker-compose -f docker-compose.dev.yml logs -f app
