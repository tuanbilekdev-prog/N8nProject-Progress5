# Script untuk Start WebApp Next.js
# Jalankan dengan: .\cloudflare\START-WEBAPP.ps1

Write-Host "=== Starting WebApp Next.js ===" -ForegroundColor Cyan

$projectDir = Split-Path -Parent $PSScriptRoot
$webappDir = Join-Path $projectDir "webapp"

# Check if webapp folder exists
if (-not (Test-Path $webappDir)) {
    Write-Host "❌ Error: webapp folder tidak ditemukan!" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path (Join-Path $webappDir "node_modules"))) {
    Write-Host "⚠️  node_modules tidak ditemukan. Installing dependencies..." -ForegroundColor Yellow
    Set-Location $webappDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: npm install gagal!" -ForegroundColor Red
        exit 1
    }
}

# Check if .env.local exists
$envFile = Join-Path $webappDir ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  .env.local tidak ditemukan!" -ForegroundColor Yellow
    Write-Host "   Pastikan file .env.local sudah dibuat di folder webapp" -ForegroundColor Yellow
    Write-Host "   Lihat webapp/README.md untuk panduan setup" -ForegroundColor Yellow
}

# Start WebApp
Write-Host "`nStarting WebApp Next.js..." -ForegroundColor Yellow
Set-Location $webappDir
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$webappDir'; npm run dev"

Write-Host "✅ WebApp starting in new PowerShell window" -ForegroundColor Green
Write-Host "`nWebApp akan running di: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Domain: https://webhook.devai.sbs" -ForegroundColor Cyan

