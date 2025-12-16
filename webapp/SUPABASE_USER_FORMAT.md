# Fix "Tenant or user not found" Error

Error ini terjadi karena format user untuk connection pooler salah.

## Solusi: Coba Format User yang Berbeda

Update file `webapp/.env.local` dan coba format user berikut (satu per satu):

### Opsi 1: Format dengan reference ID (paling umum untuk pooler)
```env
SUPABASE_DB_USER=postgres.ncruaxieqaitftcmuvmf
```

### Opsi 2: Format tanpa reference ID (untuk direct connection)
```env
SUPABASE_DB_USER=postgres
```

### Opsi 3: Format dengan project reference
```env
SUPABASE_DB_USER=postgres.ncruaxieqaitftcmuvmf
# Atau
SUPABASE_DB_USER=ncruaxieqaitftcmuvmf
```

## Cara Mengetahui Format yang Benar

1. **Cek di Supabase Dashboard:**
   - Buka **Settings → Database**
   - Scroll ke bagian **Connection string** atau **Connection info**
   - Jika ada connection string, lihat format user di dalamnya
   - Format biasanya: `postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB]`

2. **Atau coba langsung di SQL Editor:**
   - Buka Supabase Dashboard → **SQL Editor**
   - Coba query: `SELECT current_user;`
   - Ini akan menunjukkan user yang sedang digunakan

## Konfigurasi Lengkap yang Disarankan

Untuk **connection pooler** (disarankan):
```env
SUPABASE_USE_POOLER=true
SUPABASE_REF=ncruaxieqaitftcmuvmf
SUPABASE_REGION=ap-southeast-1
SUPABASE_DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.ncruaxieqaitftcmuvmf
SUPABASE_DB_PASSWORD=4yDUBESA3gctmGQb
```

Untuk **direct connection** (jika pooler tidak work):
```env
SUPABASE_USE_POOLER=false
SUPABASE_DB_HOST=db.ncruaxieqaitftcmuvmf.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=4yDUBESA3gctmGQb
```

## Setelah Update

1. **Restart development server:**
   ```bash
   # Stop server (Ctrl+C)
   cd webapp
   npm run dev
   ```

2. **Coba registrasi lagi**

3. **Cek console log** untuk melihat format user yang digunakan:
   - Di terminal yang menjalankan `npm run dev`
   - Akan muncul log: "Connecting to Supabase: { host, user, ... }"

## Troubleshooting

### Masih error "Tenant or user not found"?
- Coba format user yang berbeda (lihat opsi di atas)
- Pastikan password benar
- Cek apakah project Supabase masih aktif
- Coba reset database password di Supabase Dashboard

### Error "password authentication failed"?
- Reset password di Supabase Dashboard → Database → Settings
- Update `SUPABASE_DB_PASSWORD` di `.env.local`

### Tidak tahu region?
- Cek di Supabase Dashboard → Settings → General
- Atau coba region umum: `ap-southeast-1`, `us-east-1`, `eu-west-1`

