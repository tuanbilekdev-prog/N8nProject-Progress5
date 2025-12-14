# Script untuk setup .env.local
# Jalankan dengan: .\setup-env.ps1

$envFile = ".env.local"

# Generate random secret key
$secret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))

if (Test-Path $envFile) {
    Write-Host "File .env.local sudah ada. Memeriksa isinya..." -ForegroundColor Yellow
    
    $content = Get-Content $envFile -Raw
    
    # Check if NEXTAUTH_SECRET exists
    if ($content -notmatch "NEXTAUTH_SECRET=") {
        Write-Host "Menambahkan NEXTAUTH_SECRET..." -ForegroundColor Green
        Add-Content $envFile "`nNEXTAUTH_SECRET=$secret"
    } else {
        Write-Host "NEXTAUTH_SECRET sudah ada" -ForegroundColor Green
    }
    
    # Check if NEXTAUTH_URL exists
    if ($content -notmatch "NEXTAUTH_URL=") {
        Write-Host "Menambahkan NEXTAUTH_URL..." -ForegroundColor Green
        Add-Content $envFile "`nNEXTAUTH_URL=http://localhost:3000"
    } else {
        Write-Host "NEXTAUTH_URL sudah ada" -ForegroundColor Green
    }
} else {
    Write-Host "Membuat file .env.local baru..." -ForegroundColor Green
    
    @"
# NextAuth Configuration
NEXTAUTH_SECRET=$secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Optional)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# N8N Webhook URL
# N8N_WEBHOOK_URL=your-n8n-webhook-url
"@ | Out-File -FilePath $envFile -Encoding utf8
    
    Write-Host "File .env.local berhasil dibuat!" -ForegroundColor Green
}

Write-Host "`nSetup selesai! Silakan restart development server." -ForegroundColor Cyan

