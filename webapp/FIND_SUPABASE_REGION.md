# Cara Menemukan Region Supabase yang Benar

Semua format user gagal, kemungkinan **region salah**. Ikuti langkah ini:

## Langkah 1: Cek Region di Supabase Dashboard

1. Buka **Supabase Dashboard**
2. Klik **Settings → General** (di sidebar kiri)
3. Scroll ke bagian **Project Settings**
4. Cari informasi **Region** atau **Location** atau **Data Center**
5. Catat region yang muncul (contoh: `Southeast Asia (Singapore)`, `US East`, dll)

## Langkah 2: Map Region ke Format Pooler

Setelah dapat region, gunakan mapping ini:

| Region Display | Pooler Format |
|----------------|---------------|
| Southeast Asia (Singapore) | `ap-southeast-1` |
| Northeast Asia (Tokyo) | `ap-northeast-1` |
| US East (North Virginia) | `us-east-1` |
| US West (Oregon) | `us-west-1` |
| Europe West (Ireland) | `eu-west-1` |
| Europe Central (Frankfurt) | `eu-central-1` |
| Asia Pacific (Mumbai) | `ap-south-1` |
| Asia Pacific (Sydney) | `ap-southeast-2` |

## Langkah 3: Update .env.local

Setelah dapat region yang benar, update di `webapp/.env.local`:

```env
SUPABASE_REGION=[REGION-YANG-BENAR]
SUPABASE_DB_HOST=aws-0-[REGION-YANG-BENAR].pooler.supabase.com
```

Contoh jika region adalah "Southeast Asia (Singapore)":
```env
SUPABASE_REGION=ap-southeast-1
SUPABASE_DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
```

## Langkah 4: Test Lagi

Setelah update, jalankan:
```bash
cd webapp
node test-supabase-user.js
```

## Alternatif: Gunakan Direct Connection (Jika Pooler Tidak Work)

Jika pooler masih tidak work, coba direct connection:

1. Di Supabase Dashboard → **Settings → Database**
2. Scroll ke bagian **Connection string** (jika ada)
3. Atau coba format hostname alternatif

Update `.env.local`:
```env
SUPABASE_USE_POOLER=false
SUPABASE_DB_HOST=[HOSTNAME-DARI-SUPABASE]
SUPABASE_DB_USER=postgres
```

## Jika Masih Tidak Work

Kemungkinan masalah:
1. **Password salah** - Reset di Database Settings
2. **Project reference ID salah** - Cek di Settings → General
3. **Project tidak aktif** - Cek status project di dashboard

Coba juga:
- Reset database password di Supabase Dashboard
- Update `SUPABASE_DB_PASSWORD` di `.env.local`
- Test lagi

