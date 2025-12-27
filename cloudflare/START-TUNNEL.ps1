# Script untuk start Cloudflare Tunnel
# Jalankan dengan: .\cloudflare\START-TUNNEL.ps1

Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Yellow

# Set PATH untuk cloudflared
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Navigate ke project directory
$projectDir = Split-Path -Parent $PSScriptRoot
Set-Location $projectDir

# Start tunnel
Write-Host "Running: cloudflared tunnel --config cloudflare/tunnel-config.yaml run devai-tunnel" -ForegroundColor Cyan
cloudflared tunnel --config cloudflare/tunnel-config.yaml run devai-tunnel

