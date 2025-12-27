# Script untuk Start Semua Service
# Jalankan dengan: .\cloudflare\START-ALL.ps1

Write-Host "=== Starting All Services ===" -ForegroundColor Cyan

# 1. Start Docker Containers
Write-Host "`n1. Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d
Start-Sleep -Seconds 3

# 2. Check Docker Status
Write-Host "`n2. Docker Status:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}"

# 3. Reset DNS ke Default (DHCP/Auto)
Write-Host "`n3. Resetting DNS to default (DHCP/Auto)..." -ForegroundColor Yellow
try {
    Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ResetServerAddresses -ErrorAction Stop
    Write-Host "✅ DNS reset to default" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error resetting DNS (might need Admin): $_" -ForegroundColor Yellow
}

# 4. Flush DNS Cache
Write-Host "`n4. Flushing DNS cache..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null
Write-Host "✅ DNS cache flushed" -ForegroundColor Green

# 5. Start Cloudflare Tunnel (in new window)
Write-Host "`n5. Starting Cloudflare Tunnel..." -ForegroundColor Yellow
$projectDir = Split-Path -Parent $PSScriptRoot
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectDir'; `$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); cloudflared tunnel --config cloudflare/tunnel-config.yaml run devai-tunnel"
Write-Host "✅ Tunnel starting in new PowerShell window" -ForegroundColor Green

Write-Host "`n=== SELESAI ===" -ForegroundColor Cyan
Write-Host "`nURL yang bisa diakses:" -ForegroundColor Yellow
Write-Host "  - n8n: https://n8n.devai.sbs" -ForegroundColor Green
Write-Host "  - webhook: https://webhook.devai.sbs" -ForegroundColor Green
Write-Host "`n⚠️ Biarkan PowerShell window tunnel terbuka!" -ForegroundColor Yellow

