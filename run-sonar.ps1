# PowerShell script for running SonarCloud analysis on Windows

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Running SonarCloud Analysis Locally" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check if sonar-scanner is installed
$scannerPath = Get-Command sonar-scanner -ErrorAction SilentlyContinue
if (-not $scannerPath) {
    Write-Host "sonar-scanner is not installed!" -ForegroundColor Red
    Write-Host "Please install it first:" -ForegroundColor Yellow
    Write-Host "  - Download from: https://docs.sonarcloud.io/advanced-setup/ci-based-analysis/sonarscanner-cli/"
    Write-Host "  - Or use: choco install sonarqube-scanner (with Chocolatey)"
    Write-Host "  - Or use: scoop install sonar-scanner (with Scoop)"
    exit 1
}

# Check for SONAR_TOKEN
if (-not $env:SONAR_TOKEN) {
    Write-Host "Warning: SONAR_TOKEN environment variable is not set" -ForegroundColor Yellow
    Write-Host "You need to set your SonarCloud token:" -ForegroundColor Yellow
    Write-Host '  $env:SONAR_TOKEN = "your_token_here"' -ForegroundColor White
    Write-Host ""
    Write-Host "Get your token from: https://sonarcloud.io/account/security" -ForegroundColor Cyan
    exit 1
}

# Run backend tests with coverage
Write-Host "Running backend tests with coverage..." -ForegroundColor Green
Set-Location backend
npm run test:cov
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend tests failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Run frontend tests with coverage
Write-Host "Running frontend tests with coverage..." -ForegroundColor Green
Set-Location frontend
npm test -- --watchAll=false --coverage
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend tests failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Run SonarCloud analysis
Write-Host "Running SonarCloud analysis..." -ForegroundColor Green
sonar-scanner `
  -D"sonar.token=$env:SONAR_TOKEN" `
  -D"sonar.host.url=https://sonarcloud.io"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SonarCloud analysis completed successfully!" -ForegroundColor Green
    Write-Host "View results at: https://sonarcloud.io/dashboard?id=memory-app" -ForegroundColor Cyan
} else {
    Write-Host "✗ SonarCloud analysis failed!" -ForegroundColor Red
    exit 1
}