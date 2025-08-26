# Script para ejecutar análisis de SonarQube en Windows
# Uso: .\sonar-scan.ps1

Write-Host "🔍 Iniciando análisis de SonarQube..." -ForegroundColor Cyan

# Verificar que el token esté definido
$envFile = Get-Content .env | ConvertFrom-StringData
$token = $envFile.SONAR_TOKEN

if (-not $token) {
    Write-Host "❌ Error: Token no encontrado en archivo .env" -ForegroundColor Red
    exit 1
}

# Ejecutar el scanner
docker run --rm `
  -e SONAR_HOST_URL='http://host.docker.internal:9000' `
  -e SONAR_TOKEN="$token" `
  -v "${PWD}:/usr/src" `
  -w /usr/src `
  sonarsource/sonar-scanner-cli

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Análisis completado exitosamente!" -ForegroundColor Green
    Write-Host "📊 Ver resultados en: http://localhost:9000" -ForegroundColor Yellow
} else {
    Write-Host "❌ Error en el análisis" -ForegroundColor Red
    exit 1
}