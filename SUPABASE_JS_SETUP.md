# Setup Supabase dengan JS Client (MUDAH!)

Panduan ini jauh lebih mudah daripada setup Postgres langsung. Hanya butuh 2 nilai dari Supabase!

## Langkah 1: Ambil Supabase URL dan Anon Key

1. Buka **Supabase Dashboard**
2. Klik **Settings → API** (di sidebar)
3. Di halaman API, kamu akan lihat:
   - **Project URL**: Contoh `https://xxxxx.supabase.co`
   - **anon public key**: String panjang (contoh: `eyJhbGc...`)

**Copy kedua nilai ini!**

## Langkah 2: Update `.env.local`

Buka file `webapp/.env.local` dan tambahkan/update:

```env
# Supabase Configuration (MUDAH - hanya 2 nilai!)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Ganti dengan nilai dari Supabase Dashboard kamu!**

## Langkah 3: Pastikan SQL Schema Sudah Dijalankan

Pastikan kamu sudah menjalankan `supabase-schema.sql` di Supabase SQL Editor.

## Langkah 4: Restart Server

```bash
cd webapp
# Stop server (Ctrl+C)
npm run dev
```

## Langkah 5: Test

1. Buka `http://localhost:3000/register`
2. Daftar akun baru
3. Cek di Supabase Dashboard → Tables → users (harus ada user baru)

## Selesai! 🎉

Tidak perlu ribet dengan:
- ❌ Hostname
- ❌ Port
- ❌ User/Password
- ❌ Region
- ❌ Pooler
- ❌ SSL config

Hanya butuh:
- ✅ URL
- ✅ Anon Key

## Untuk n8n Docker

n8n tetap bisa pakai Supabase Postgres untuk Chat Memory. Di n8n, kamu bisa:
1. Pakai connection string dari Supabase (jika ada)
2. Atau pakai Postgres Docker yang sudah ada di `docker-compose.yml`

Keduanya bisa jalan bersamaan!

