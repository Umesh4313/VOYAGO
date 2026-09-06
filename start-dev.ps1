# VOYAGO Development Startup Script
# This script starts MongoDB, Backend (Spring Boot), and Frontend (React + Vite)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VOYAGO Development Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "[1/3] Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✓ MongoDB is already running" -ForegroundColor Green
} else {
    Write-Host "✗ MongoDB is not running" -ForegroundColor Red
    Write-Host "Please start MongoDB manually:" -ForegroundColor Yellow
    Write-Host "  Option 1: Run 'mongod' in a separate terminal" -ForegroundColor White
    Write-Host "  Option 2: Start MongoDB as a service" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}
Write-Host ""

# Start Backend (Spring Boot)
Write-Host "[2/3] Starting Backend (Spring Boot on port 8001)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting Spring Boot Backend...' -ForegroundColor Green; mvn spring-boot:run"
Write-Host "✓ Backend starting in new window..." -ForegroundColor Green
Start-Sleep -Seconds 3
Write-Host ""

# Start Frontend (React + Vite)
Write-Host "[3/3] Starting Frontend (React + Vite on port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host 'Starting React Frontend...' -ForegroundColor Green; npm run dev"
Write-Host "✓ Frontend starting in new window..." -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Development servers are starting!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8001/api" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Note: Backend may take 30-60 seconds to fully start" -ForegroundColor Yellow
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
Write-Host ""
