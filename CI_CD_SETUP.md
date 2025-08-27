# CI/CD Setup Guide

## Overview
Este proyecto utiliza GitHub Actions para CI/CD con las siguientes características:
- Tests automatizados para backend (NestJS) y frontend (React)
- Linting con ESLint para TypeScript/JavaScript
- Análisis de código con SonarCloud
- Pre-commit hooks para validaciones locales

## Configuración en GitHub

### 1. Secrets necesarios
Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions y añade:

- `SONAR_TOKEN`: Token de SonarCloud (obtenlo desde https://sonarcloud.io/account/security)

### 2. SonarCloud Setup
1. Ve a https://sonarcloud.io/
2. Conecta tu cuenta de GitHub
3. Importa tu repositorio
4. En el archivo `sonar-project.properties`, actualiza:
   - `sonar.organization`: tu nombre de usuario u organización en GitHub
   - `sonar.projectKey`: el key de tu proyecto en SonarCloud

## Desarrollo Local

### Instalar pre-commit hooks
```bash
pip install pre-commit
pre-commit install
```

### Ejecutar validaciones manualmente

#### Linting con ESLint

**Backend (NestJS):**
```bash
cd backend
npm run lint        # Ejecuta ESLint y corrige automáticamente
npm run format      # Formatea código con Prettier
```

**Frontend (React):**
```bash
cd frontend
npm run lint        # Ejecuta ESLint
```

#### Tests

**Backend:**
```bash
cd backend
npm test            # Ejecuta tests
npm run test:watch  # Tests en modo watch
npm run test:cov    # Tests con cobertura
npm run test:e2e    # Tests end-to-end
```

**Frontend:**
```bash
cd frontend
npm test                           # Tests en modo interactivo
npm test -- --watchAll=false       # Ejecuta tests una vez
npm test -- --coverage             # Tests con cobertura
```

#### Análisis con SonarCloud local
```bash
# En Linux/Mac
export SONAR_TOKEN=your_token_here
./run-sonar.sh

# En Windows PowerShell
$env:SONAR_TOKEN = "your_token_here"
.\run-sonar.ps1
```

## Pipeline CI/CD

El pipeline se ejecuta automáticamente en:
- Push a las ramas `main` o `develop`
- Pull requests hacia `main` o `develop`

### Trabajos del Pipeline

1. **backend-tests**: 
   - Configura Node.js 20
   - Instala dependencias
   - Ejecuta ESLint para linting
   - Ejecuta tests con Jest
   - Genera reporte de cobertura
   - Servicios: PostgreSQL y Redis

2. **frontend-tests**:
   - Configura Node.js 20
   - Instala dependencias
   - Ejecuta linter
   - Verifica tipos con TypeScript
   - Ejecuta tests
   - Construye la aplicación

3. **sonarcloud**:
   - Depende de los tests anteriores
   - Genera reportes de cobertura
   - Envía análisis a SonarCloud

## Configuración de ESLint

### Backend
El archivo `.eslintrc.js` está configurado con:
- Parser de TypeScript
- Reglas recomendadas de TypeScript
- Integración con Prettier
- Ignora archivos de distribución y node_modules

### Frontend
Usa la configuración por defecto de Create React App con TypeScript.

## Flujo de trabajo recomendado

1. **Antes de hacer commit:**
   - Los pre-commit hooks ejecutarán validaciones automáticamente
   - Si fallan, corrige los errores y vuelve a intentar

2. **Antes de push:**
   ```bash
   # Backend
   cd backend
   npm run lint
   npm test
   
   # Frontend
   cd ../frontend
   npm run lint
   npm test -- --watchAll=false
   
   # Opcional: ejecuta análisis de Sonar
   cd ..
   ./run-sonar.sh  # o .\run-sonar.ps1 en Windows
   ```

3. **Después del push:**
   - Verifica que el pipeline pase en GitHub Actions
   - Revisa los resultados en SonarCloud

## Troubleshooting

### Pre-commit hooks fallan
```bash
# Omitir hooks temporalmente (no recomendado)
git commit --no-verify

# Actualizar hooks
pre-commit autoupdate
```

### ESLint errors
```bash
# Corregir automáticamente
cd backend
npm run lint

# Ver errores sin corregir
npx eslint "{src,apps,libs,test}/**/*.ts"
```

### Tests fallan en CI pero pasan localmente
- Verifica las variables de entorno en el workflow
- Asegúrate de que las versiones de Node coincidan (v20)
- Revisa los servicios (PostgreSQL, Redis) en el CI
- Verifica que las dependencias estén actualizadas con `npm ci`

### SonarCloud no encuentra el proyecto
- Verifica que `sonar.organization` esté correctamente configurado
- Asegúrate de que el token SONAR_TOKEN sea válido
- Verifica que el proyecto esté importado en SonarCloud

## Scripts útiles

```bash
# Ejecutar todo el flujo localmente
npm run lint && npm test && npm run build

# Verificar formato de código
cd backend && npm run format
```