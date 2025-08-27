.PHONY: help up down logs build clean dev test

# ========== COMANDOS EXISTENTES (DOCKER) ==========

help:
	@echo "Available commands:"
	@echo ""
	@echo "🐳 Docker Commands:"
	@echo "  make up              - Start all services in development mode"
	@echo "  make down            - Stop all services"
	@echo "  make logs            - View logs from all services"
	@echo "  make build           - Build/rebuild all Docker images"
	@echo "  make clean           - Clean up containers, volumes, and images"
	@echo "  make dev             - Start development environment with logs"
	@echo "  make restart         - Restart all services"
	@echo ""
	@echo "🔍 Linting & Formatting:"
	@echo "  make lint            - Run ESLint on both backend and frontend"
	@echo "  make lint-backend    - Run ESLint on backend"
	@echo "  make lint-frontend   - Run ESLint on frontend"
	@echo "  make lint-fix        - Auto-fix ESLint errors"
	@echo "  make format          - Format code with Prettier"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test            - Run all tests"
	@echo "  make test-backend    - Run backend tests"
	@echo "  make test-frontend   - Run frontend tests"
	@echo "  make test-cov        - Run tests with coverage"
	@echo "  make test-e2e        - Run e2e tests"
	@echo ""
	@echo "🚀 CI/CD:"
	@echo "  make ci-check        - Run all CI validations locally"
	@echo "  make sonar           - Run SonarCloud analysis"
	@echo "  make pre-commit      - Install pre-commit hooks"
	@echo ""
	@echo "🛠️ Development:"
	@echo "  make install         - Install all dependencies"
	@echo "  make validate        - Run lint + types + tests"
	@echo "  make check-types     - Check TypeScript types"

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

backend-shell:
	docker exec -it memory_backend sh

frontend-shell:
	docker exec -it memory_frontend sh

db-shell:
	docker exec -it memory_postgres psql -U admin -d memory_db

# ========== NUEVOS COMANDOS DE LINTING ==========

.PHONY: lint
lint: ## Ejecuta ESLint en backend y frontend
	@echo "🔍 Linting Backend..."
	@cd backend && npm run lint
	@echo ""
	@echo "🔍 Linting Frontend..."
	@cd frontend && npm run lint

.PHONY: lint-backend
lint-backend: ## Ejecuta ESLint solo en backend
	cd backend && npm run lint

.PHONY: lint-frontend
lint-frontend: ## Ejecuta ESLint solo en frontend
	cd frontend && npm run lint

.PHONY: lint-fix
lint-fix: ## Corrige errores de ESLint automáticamente
	@echo "🔧 Auto-fixing Backend..."
	@cd backend && npx eslint "{src,apps,libs,test}/**/*.ts" --fix
	@echo ""
	@echo "🔧 Auto-fixing Frontend..."
	@cd frontend && npx eslint "src/**/*.{ts,tsx}" --fix

.PHONY: lint-watch
lint-watch: ## Ejecuta ESLint en modo watch (backend)
	cd backend && npx eslint "{src,apps,libs,test}/**/*.ts" --watch

# ========== COMANDOS DE FORMATEO ==========

.PHONY: format
format: ## Formatea código con Prettier
	@echo "✨ Formatting Backend..."
	@cd backend && npm run format
	@echo ""
	@echo "✨ Formatting Frontend..."
	@cd frontend && npx prettier --write "src/**/*.{ts,tsx,js,jsx,css}"

.PHONY: format-check
format-check: ## Verifica formato sin cambiar archivos
	@cd backend && npx prettier --check "src/**/*.ts"
	@cd frontend && npx prettier --check "src/**/*.{ts,tsx,js,jsx,css}"

# ========== COMANDOS DE TESTING (LOCAL) ==========

.PHONY: test-local
test-local: ## Ejecuta tests localmente (sin Docker)
	@echo "🧪 Testing Backend..."
	@cd backend && npm test
	@echo ""
	@echo "🧪 Testing Frontend..."
	@cd frontend && npm test -- --watchAll=false

.PHONY: test-backend-local
test-backend-local: ## Tests del backend local
	cd backend && npm test

.PHONY: test-frontend-local
test-frontend-local: ## Tests del frontend local
	cd frontend && npm test -- --watchAll=false

.PHONY: test-watch
test-watch: ## Tests en modo watch (backend)
	cd backend && npm run test:watch

.PHONY: test-cov
test-cov: ## Tests con coverage
	@echo "📊 Backend Coverage..."
	@cd backend && npm run test:cov
	@echo ""
	@echo "📊 Frontend Coverage..."
	@cd frontend && npm test -- --coverage --watchAll=false

.PHONY: test-e2e
test-e2e: ## Tests e2e del backend
	cd backend && npm run test:e2e

# ========== COMANDOS DE CI/CD ==========

.PHONY: ci-check
ci-check: lint check-types test-local ## Ejecuta todas las validaciones del CI
	@echo "✅ All CI checks passed!"

.PHONY: pre-commit
pre-commit: ## Instala pre-commit hooks
	pip install pre-commit
	pre-commit install
	@echo "✅ Pre-commit hooks installed!"

.PHONY: pre-commit-run
pre-commit-run: ## Ejecuta pre-commit en todos los archivos
	pre-commit run --all-files

.PHONY: sonar
sonar: ## Ejecuta análisis local con SonarCloud (requiere token configurado)
ifdef OS
	@powershell -ExecutionPolicy Bypass -File run-sonar.ps1
else
	@./run-sonar.sh
endif

# ========== COMANDOS DE INSTALACIÓN ==========

.PHONY: install
install: ## Instala todas las dependencias
	@echo "📦 Installing Backend dependencies..."
	@cd backend && npm install
	@echo ""
	@echo "📦 Installing Frontend dependencies..."
	@cd frontend && npm install

.PHONY: install-backend
install-backend: ## Instala dependencias del backend
	cd backend && npm install

.PHONY: install-frontend
install-frontend: ## Instala dependencias del frontend
	cd frontend && npm install

# ========== COMANDOS DE VALIDACIÓN ==========

.PHONY: check-types
check-types: ## Verifica tipos de TypeScript
	@echo "📝 Checking Backend Types..."
	@cd backend && npx tsc --noEmit
	@echo ""
	@echo "📝 Checking Frontend Types..."
	@cd frontend && npx tsc --noEmit

.PHONY: validate
validate: lint check-types test-local ## Valida todo (lint + types + tests)
	@echo "✅ All validations passed!"

# ========== COMANDOS DE BUILD LOCAL ==========

.PHONY: build-local
build-local: ## Build local (sin Docker)
	@echo "🏗️ Building Backend..."
	@cd backend && npm run build
	@echo ""
	@echo "🏗️ Building Frontend..."
	@cd frontend && npm run build

.PHONY: build-backend
build-backend: ## Build del backend
	cd backend && npm run build

.PHONY: build-frontend
build-frontend: ## Build del frontend
	cd frontend && npm run build

# ========== COMANDOS DE DESARROLLO LOCAL ==========

.PHONY: dev-backend
dev-backend: ## Inicia backend en modo desarrollo (local)
	cd backend && npm run start:dev

.PHONY: dev-frontend
dev-frontend: ## Inicia frontend en modo desarrollo (local)
	cd frontend && npm run dev

.PHONY: dev-local
dev-local: ## Inicia backend y frontend localmente
	@echo "Starting backend and frontend in parallel..."
	@make -j 2 dev-backend dev-frontend

# ========== COMANDOS DE LIMPIEZA ==========

.PHONY: clean-deps
clean-deps: ## Limpia node_modules
	@echo "🧹 Cleaning node_modules..."
	@rm -rf backend/node_modules frontend/node_modules

.PHONY: clean-dist
clean-dist: ## Limpia archivos compilados
	@echo "🧹 Cleaning build files..."
	@rm -rf backend/dist frontend/build
	@rm -rf backend/coverage frontend/coverage

.PHONY: clean-all
clean-all: clean clean-deps clean-dist ## Limpieza completa
	@echo "✅ Complete cleanup done!"

# ========== COMANDOS DE BASE DE DATOS ==========

.PHONY: db-migrate
db-migrate: ## Ejecuta migraciones
	cd backend && npm run migration:run

.PHONY: db-seed
db-seed: ## Ejecuta seeders
	cd backend && npm run seed:run

.PHONY: db-reset
db-reset: ## Resetea la base de datos
	docker-compose down -v
	docker-compose up -d postgres redis
	@echo "Waiting for database..."
	@sleep 5
	cd backend && npm run migration:run