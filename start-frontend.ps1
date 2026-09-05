# Start VOYAGO Frontend (React + Vite)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting VOYAGO Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "Running: npm run dev" -ForegroundColor Yellow
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host ""

npm run dev
