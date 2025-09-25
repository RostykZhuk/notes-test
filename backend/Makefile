# QuickNotes Backend Makefile

.PHONY: help install build up down logs clean test dev prod restart

# Default target
help:
	@echo "QuickNotes Backend - Available commands:"
	@echo "  install     - Install dependencies"
	@echo "  build       - Build Docker images"
	@echo "  up          - Start all services in production mode"
	@echo "  dev         - Start all services in development mode with live reload"
	@echo "  down        - Stop all services"
	@echo "  logs        - Show logs from all services"
	@echo "  clean       - Remove containers, volumes, and images"
	@echo "  test        - Run tests"
	@echo "  restart     - Restart all services"
	@echo "  db-migrate  - Run database migrations"
	@echo "  health      - Check health of all services"

# Install dependencies
install:
	npm install

# Build Docker images
build:
	docker-compose build

# Start services in production mode
up:
	docker-compose up -d
	@echo "Services started! API available at http://localhost:8080"
	@echo "Direct API instances at http://localhost:3001 and http://localhost:3002"

# Start services in development mode
dev:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
	@echo "Development services started! API available at http://localhost:8080"

# Stop all services
down:
	docker-compose down

# Show logs
logs:
	docker-compose logs -f

# Clean up everything
clean:
	docker-compose down -v --rmi all --remove-orphans

# Run tests
test:
	npm test

# Restart services
restart: down up

# Run database migrations
db-migrate:
	docker-compose exec api-1 npm run migrate

# Check health of services
health:
	@echo "Checking service health..."
	@curl -s http://localhost:8080/health | jq . || echo "Load balancer health check failed"
	@curl -s http://localhost:8080/api-health | jq . || echo "API health check failed"

# Setup for first time
setup:
	@echo "Setting up QuickNotes for the first time..."
	@if [ ! -f .env ]; then cp env.example .env; echo "Created .env file from example"; fi
	@echo "Please edit .env file with your configuration"
	@echo "Then run 'make build && make up' to start the application"

# Production deployment
prod:
	@echo "Starting production deployment..."
	docker-compose -f docker-compose.yml up -d --build
	@echo "Production services started!"

# Development with logs
dev-logs:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Stop and remove everything for fresh start
reset: clean
	docker system prune -f
