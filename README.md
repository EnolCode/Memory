# Memory Project

Stack tecnológico completo con Docker y DevContainer. **NO necesitas instalar nada en tu máquina local**, todo funciona dentro de Docker.

## 🚀 Stack Tecnológico

- **Backend**: NestJS con TypeScript
- **Frontend**: Vue 3 + Vite + TypeScript
- **Base de datos**: PostgreSQL 16
- **Cache**: Redis 7
- **Gestión de paquetes**: pnpm (dentro de Docker)
- **Contenerización**: Docker & Docker Compose
- **Node**: v22 LTS (dentro de Docker)

## 📋 Requisitos Previos

Solo necesitas:
- **Docker Desktop** (o Docker Engine + Docker Compose)
- **VS Code** (opcional, para usar DevContainer)

## 🛠️ Instalación

1. Clona el repositorio (o copia los archivos)
2. Copia el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
3. Ajusta las variables según necesites (opcional)

## 🚀 Inicio Rápido

### Opción 1: Con Docker Compose (Recomendado)

```bash
# Construir e iniciar todos los servicios (primera vez)
docker-compose up --build

# O usar Make
make up

# Ver logs
make logs

# Detener servicios
make down
```

**Nota**: La primera vez tardará unos minutos mientras Docker descarga las imágenes e instala las dependencias.

### Opción 2: Con VS Code DevContainer

1. Abre el proyecto en VS Code
2. Instala la extensión "Dev Containers"
3. Ctrl+Shift+P → "Dev Containers: Reopen in Container"
4. VS Code automáticamente:
   - Construirá los contenedores
   - Instalará las dependencias
   - Iniciará todos los servicios
   - Abrirá el terminal dentro del contenedor

## 📁 Estructura del Proyecto

```
memory/
├── backend/          # API NestJS
├── frontend/         # App Vue 3
├── database/         # Scripts SQL iniciales
├── .devcontainer/    # Configuración DevContainer
├── .vscode/          # Configuración VS Code
├── docker-compose.yml
├── Makefile
└── README.md
```

## 🔗 URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📜 Comandos Disponibles

Todos los comandos funcionan **sin necesidad de instalar nada localmente**:

```bash
make help        # Ver todos los comandos
make up          # Iniciar servicios
make down        # Detener servicios
make logs        # Ver logs
make build       # Reconstruir imágenes
make clean       # Limpiar todo (incluyendo volúmenes)
make dev         # Modo desarrollo con logs
make test        # Ejecutar tests dentro de contenedores
```

### Comandos Docker directos:

```bash
# Iniciar todo
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Reconstruir si hay cambios
docker-compose up --build

# Detener
docker-compose down

# Limpiar todo (incluyendo volúmenes)
docker-compose down -v
```

## 🔧 Configuración

### Variables de Entorno

Revisa `.env.example` para ver todas las variables disponibles.

### Extensiones VS Code Recomendadas

- ESLint
- Prettier
- Volar (Vue)
- Docker
- Thunder Client (API testing)

## 🧪 Testing

Los tests se ejecutan dentro de los contenedores:

```bash
# Ejecutar todos los tests
make test

# Solo backend
make test-backend

# Solo frontend
make test-frontend

# O con Docker directamente
docker-compose exec backend pnpm test
docker-compose exec frontend pnpm test
```

## 📝 Notas Importantes

- **No necesitas Node.js, npm, pnpm o ninguna herramienta instalada localmente**
- Todo el desarrollo se hace dentro de contenedores Docker
- Los volúmenes de Docker persisten:
  - Datos de PostgreSQL y Redis
  - node_modules (para mejor rendimiento)
- El hot reload está habilitado en ambos servicios
- Los cambios en el código se reflejan automáticamente
- Para cambiar de PC: solo copia la carpeta y ejecuta `docker-compose up`
