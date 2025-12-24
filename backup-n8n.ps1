# Backup Script untuk n8n Docker
# Jalankan: .\backup-n8n.ps1

$backupDir = "backups"
$date = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "=== Backup n8n Data ===" -ForegroundColor Green
Write-Host ""

# Buat folder backup jika belum ada
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "✓ Folder backup dibuat: $backupDir" -ForegroundColor Yellow
}

# Backup folder n8n_data
Write-Host "1. Backup folder n8n_data..." -ForegroundColor Cyan
if (Test-Path "n8n_data") {
    $n8nDataBackup = "$backupDir\n8n_data_$date.zip"
    Compress-Archive -Path "n8n_data" -DestinationPath $n8nDataBackup -Force
    $size = (Get-Item $n8nDataBackup).Length / 1MB
    Write-Host "   ✓ n8n_data backed up: $n8nDataBackup ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Folder n8n_data tidak ditemukan (akan dibuat saat container pertama kali jalan)" -ForegroundColor Yellow
}

# Backup database PostgreSQL
Write-Host "2. Backup PostgreSQL database..." -ForegroundColor Cyan
$dbBackup = "$backupDir\postgres_backup_$date.sql"
try {
    docker exec n8n_postgres pg_dump -U n8n n8n > $dbBackup 2>&1
    if ($LASTEXITCODE -eq 0) {
        $size = (Get-Item $dbBackup).Length / 1MB
        Write-Host "   ✓ Database backed up: $dbBackup ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Gagal backup database (pastikan container 'n8n_postgres' berjalan)" -ForegroundColor Red
        Write-Host "   Cek dengan: docker ps" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Backup Selesai ===" -ForegroundColor Green
Write-Host "File tersimpan di: $PWD\$backupDir" -ForegroundColor Cyan
Write-Host ""

