.PHONY: help up down logs build clean dev test

help:
	@echo "Available commands:"
	@echo "  make up       - Start all services in development mode"
	@echo "  make down     - Stop all services"
	@echo "  make logs     - View logs from all services"
	@echo "  make build    - Build/rebuild all Docker images"
	@echo "  make clean    - Clean up containers, volumes, and images"
	@echo "  make dev      - Start development environment with logs"
	@echo "  make test     - Run tests inside containers"

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

build:
	docker-compose build

clean:
	docker-compose down -v
	docker system prune -af

dev:
	docker-compose up

test:
	docker-compose exec backend pnpm test
	docker-compose exec frontend pnpm test

test-backend:
	docker-compose exec backend pnpm test

test-frontend:
	docker-compose exec frontend pnpm test

backend-logs:
	docker-compose logs -f backend

frontend-logs:
	docker-compose logs -f frontend

db-logs:
	docker-compose logs -f postgres

redis-logs:
	docker-compose logs -f redis

restart:
	docker-compose restart

restart-backend:
	docker-compose restart backend

restart-frontend:
	docker-compose restart frontend