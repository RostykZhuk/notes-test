#!/bin/bash

# QuickNotes Backend Setup Script

set -e

echo "🚀 Setting up QuickNotes Backend..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "✅ Created .env file. Please edit it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check health
echo "🏥 Checking service health..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Load balancer is healthy!"
else
    echo "⚠️ Load balancer health check failed"
fi

if curl -s http://localhost:8080/api-health > /dev/null; then
    echo "✅ API services are healthy!"
else
    echo "⚠️ API health check failed"
fi

echo ""
echo "🎉 QuickNotes Backend setup complete!"
echo ""
echo "📍 API is available at: http://localhost:8080"
echo "📍 Health check: http://localhost:8080/health"
echo "📍 Metrics: http://localhost:8080/metrics"
echo ""
echo "📚 API Documentation:"
echo "   - Register: POST /api/auth/register"
echo "   - Login: POST /api/auth/login"
echo "   - Notes: GET/POST/PUT/DELETE /api/notes"
echo "   - Search: GET /api/notes/search?tags=work,ideas"
echo ""
echo "🔧 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart: docker-compose restart"
echo ""
echo "💡 For development with live reload:"
echo "   docker-compose -f docker-compose.yml -f docker-compose.override.yml up"
