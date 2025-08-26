# Docker Compose - Guía de Uso

## Servicios Disponibles

### Servicios Principales (siempre activos)
- **PostgreSQL**: Base de datos principal (puerto 5433)
- **Redis**: Cache y sesiones (puerto 6379)
- **Backend**: API Node.js/NestJS (puerto 3000)
- **Frontend**: Aplicación Vue.js (puerto 5173)

### Servicios de Desarrollo (opcionales con perfil)
- **SonarQube**: Análisis de calidad de código (puerto 9000)

## Comandos Básicos

### Levantar solo servicios principales
```bash
docker-compose up -d
```

### Levantar servicios principales + SonarQube
```bash
docker-compose --profile dev up -d
# o
docker-compose --profile sonar up -d
```

### Detener todos los servicios
```bash
docker-compose down
```

### Ver logs
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
```

### Reiniciar un servicio
```bash
docker-compose restart backend
```

## Análisis con SonarQube

1. Levantar SonarQube:
```bash
docker-compose --profile sonar up -d sonarqube
```

2. Acceder a http://localhost:9000 (admin/admin)

3. Ejecutar análisis:

### Windows (PowerShell)
```powershell
.\sonar-scan.ps1
```

### Linux/Mac
```bash
./sonar-scan.sh
```

### Comando directo (Windows PowerShell)
```powershell
docker run --rm `
  -e SONAR_HOST_URL='http://host.docker.internal:9000' `
  -e SONAR_TOKEN='sqp_c43dfbbd61d8d587d6420f0e9dd33ca7bc692f06' `
  -v "${PWD}:/usr/src" `
  -w /usr/src `
  sonarsource/sonar-scanner-cli
```

## Volúmenes Persistentes

Los siguientes datos persisten entre reinicios:
- `postgres_data`: Datos de PostgreSQL
- `redis_data`: Datos de Redis
- `sonarqube_data`: Configuración y datos de SonarQube
- `backend_node_modules`: Dependencias del backend
- `frontend_node_modules`: Dependencias del frontend

Para limpiar todos los volúmenes:
```bash
docker-compose down -v
```