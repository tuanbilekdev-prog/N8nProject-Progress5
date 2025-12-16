# Fix Supabase Connection - Panduan Cepat

## Masalah: `getaddrinfo ENOTFOUND db.xxxxx.supabase.co`

Error ini terjadi karena hostname tidak bisa di-resolve. Berikut solusinya:

## Solusi 1: Gunakan Connection Pooler (DISARANKAN)

### Langkah 1: Update `.env.local`

Tambahkan atau update variabel berikut di `webapp/.env.local`:

```env
# Supabase Database Configuration
# Gunakan connection pooler (lebih reliable)
SUPABASE_USE_POOLER=true
SUPABASE_REF=ncruaxieqaitftcmuvmf
SUPABASE_REGION=ap-southeast-1
SUPABASE_DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.ncruaxieqaitftcmuvmf
SUPABASE_DB_PASSWORD=4yDUBESA3gctmGQb
```

**Cara mendapatkan nilai-nilai:**

1. **SUPABASE_REF**: Dari hostname lama kamu: `db.ncruaxieqaitftcmuvmf.supabase.co` → ref = `ncruaxieqaitftcmuvmf`
2. **SUPABASE_REGION**: 
   - Cek di Supabase Dashboard → Settings → General
   - Atau coba region umum: `ap-southeast-1` (Southeast Asia), `us-east-1` (US East), dll
3. **SUPABASE_DB_USER**: Format pooler adalah `postgres.[ref]`

### Langkah 2: Restart Server

```bash
cd webapp
# Stop server (Ctrl+C)
npm run dev
```

## Solusi 2: Cari Region yang Benar

Jika Solusi 1 tidak work, cari region yang benar:

1. Buka Supabase Dashboard
2. Klik **Settings → General**
3. Cari informasi **Region** atau **Location**
4. Update `SUPABASE_REGION` di `.env.local` dengan region yang benar

Region umum:
- `ap-southeast-1` - Southeast Asia (Singapore)
- `ap-northeast-1` - Northeast Asia (Tokyo)
- `us-east-1` - US East
- `us-west-1` - US West
- `eu-west-1` - Europe West
- `eu-central-1` - Europe Central

## Solusi 3: Test Koneksi Manual

Jalankan script test:

```bash
cd webapp
node test-supabase-connection.js
```

Script ini akan test koneksi dan memberikan error message yang lebih jelas.

## Solusi 4: Gunakan Supabase JS Client (Alternatif)

Jika masih tidak work, kita bisa switch ke Supabase JS client yang lebih mudah. Tapi ini require perubahan code yang lebih besar.

## Troubleshooting

### Error: "Connection timeout"
- Cek apakah project Supabase masih aktif
- Cek apakah password benar
- Coba region yang berbeda

### Error: "SSL required"
- Pastikan SSL sudah diaktifkan (sudah ada di code)

### Error: "password authentication failed"
- Reset password di Supabase Dashboard → Database → Settings
- Update `SUPABASE_DB_PASSWORD` di `.env.local`

## Format Connection String yang Benar

### Direct Connection (biasanya tidak work):
```
postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

### Pooler Connection (DISARANKAN):
```
postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

Contoh:
```
postgresql://postgres.ncruaxieqaitftcmuvmf:4yDUBESA3gctmGQb@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

