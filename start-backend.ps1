# Start VOYAGO Backend (Spring Boot)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting VOYAGO Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

Write-Host "Running: mvn spring-boot:run" -ForegroundColor Yellow
Write-Host "Backend will be available at: http://localhost:8001/api" -ForegroundColor Green
Write-Host ""

mvn spring-boot:run
