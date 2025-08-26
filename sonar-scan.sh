#!/bin/bash

# Script para ejecutar análisis de SonarQube en Linux/Mac
# Uso: ./sonar-scan.sh

echo "🔍 Iniciando análisis de SonarQube..."

# Leer el token del archivo .env si existe
if [ -f .env ]; then
    export $(cat .env | grep SONAR_TOKEN | xargs)
fi

# Si no hay token en .env, usar el valor por defecto
SONAR_TOKEN=${SONAR_TOKEN:-sqp_c43dfbbd61d8d587d6420f0e9dd33ca7bc692f06}

# Ejecutar el scanner
docker run --rm \
  -e SONAR_HOST_URL=http://host.docker.internal:9000 \
  -e SONAR_TOKEN=$SONAR_TOKEN \
  -v "${PWD}:/usr/src" \
  -w /usr/src \
  sonarsource/sonar-scanner-cli

if [ $? -eq 0 ]; then
    echo "✅ Análisis completado exitosamente!"
    echo "📊 Ver resultados en: http://localhost:9000"
else
    echo "❌ Error en el análisis"
    exit 1
fi