# Setup Supabase untuk NextAuth & Chat Memory

Panduan lengkap untuk setup Supabase sebagai database untuk NextAuth (login) dan Chat Memory.

## 1. Setup Supabase Project

1. Buka [Supabase Dashboard](https://app.supabase.com/)
2. Buat project baru atau gunakan project yang sudah ada
3. Catat informasi koneksi:
   - **Host**: Ada di Settings → Database → Connection string
   - **Port**: Biasanya `5432`
   - **Database**: Biasanya `postgres`
   - **User**: Biasanya `postgres.xxxxx` atau `postgres`
   - **Password**: Password database kamu

## 2. Jalankan SQL Schema

1. Buka Supabase Dashboard → **SQL Editor**
2. Copy seluruh isi file `supabase-schema.sql`
3. Paste ke SQL Editor
4. Klik **Run** untuk menjalankan script

Script ini akan membuat:
- ✅ Tabel `users` (untuk NextAuth)
- ✅ Tabel `accounts` (untuk OAuth providers)
- ✅ Tabel `sessions` (untuk session management)
- ✅ Tabel `verification_tokens` (untuk email verification)
- ✅ Tabel `chat_sessions` (untuk riwayat chat)
- ✅ Tabel `chat_messages` (untuk pesan per session)
- ✅ Indexes untuk performa
- ✅ Triggers untuk auto-update `updated_at`

## 3. Setup Environment Variables

Tambahkan ke file `webapp/.env.local`:

```env
# Supabase Database Configuration
SUPABASE_DB_HOST=your-supabase-host.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.xxxxx
SUPABASE_DB_PASSWORD=your-supabase-password
```

**Cara mendapatkan nilai-nilai ini:**

1. Buka Supabase Dashboard → **Settings → Database**
2. Scroll ke bagian **Connection string**
3. Pilih **URI** atau **Node.js**
4. Copy connection string, contoh:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```
5. Parse nilai-nilainya:
   - **Host**: `aws-0-ap-southeast-1.pooler.supabase.com`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres.xxxxx`
   - **Password**: `[YOUR-PASSWORD]`

## 4. Setup n8n Postgres Chat Memory

Di n8n UI:

1. Buka workflow **"Progress 5 + 4, webhook"**
2. Klik node **"Postgres Chat Memory"**
3. Di tab **Credentials**, klik **Create New** atau **Edit**
4. Pilih credential type: **Postgres**
5. Isi dengan informasi Supabase:
   - **Host**: `your-supabase-host.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres.xxxxx`
   - **Password**: `your-supabase-password`
   - **SSL**: **Enable** (penting! Supabase memerlukan SSL)
     - Mode: `require` atau `prefer`
6. Klik **Test connection** untuk memastikan koneksi berhasil
7. Klik **Save**

## 5. Verifikasi Setup

### Test NextAuth dengan Supabase:

1. Restart development server: `npm run dev`
2. Buka halaman register: `http://localhost:3000/register`
3. Daftar akun baru
4. Cek di Supabase Dashboard → **Table Editor → users**
   - Harus muncul user baru yang baru didaftarkan

### Test Chat Memory:

1. Login ke aplikasi
2. Mulai chat baru
3. Kirim beberapa pesan
4. Cek di Supabase Dashboard:
   - **Table Editor → chat_sessions**: Harus ada session baru
   - **Table Editor → chat_messages**: Harus ada pesan-pesan

### Test n8n Postgres Chat Memory:

1. Jalankan workflow **"Progress 5 + 4, webhook"**
2. Kirim test request ke webhook
3. Cek di Supabase Dashboard → **Table Editor → chat_messages**
   - Harus ada pesan yang disimpan oleh n8n

## 6. Troubleshooting

### Error: "Connection refused" atau "ECONNREFUSED"

- Pastikan **Host** benar (tanpa `https://` atau `http://`)
- Pastikan **Port** adalah `5432`
- Pastikan Supabase project masih aktif

### Error: "password authentication failed"

- Pastikan **User** dan **Password** benar
- Cek di Supabase Dashboard → Settings → Database → Connection string

### Error: "SSL required"

- Pastikan **SSL** diaktifkan di credential n8n
- Set mode ke `require` atau `prefer`

### Error: "relation does not exist"

- Pastikan SQL schema sudah dijalankan di Supabase SQL Editor
- Cek di Supabase Dashboard → Table Editor apakah tabel-tabel sudah ada

### Chat tidak tersimpan

- Cek console browser untuk error
- Cek Supabase Dashboard → Logs untuk melihat query error
- Pastikan environment variables sudah diisi dengan benar

## 7. Catatan Penting

- ✅ **SSL wajib diaktifkan** untuk koneksi Supabase
- ✅ **Password jangan di-commit** ke repository (sudah ada di `.env.local` yang di-ignore)
- ✅ **Index name** di n8n Pinecone harus sama dengan yang di workflow 4
- ✅ Supabase memiliki **connection pooler**, jadi bisa handle banyak koneksi

## 8. Production Checklist

Sebelum deploy ke production:

- [ ] Pastikan Supabase project menggunakan plan yang sesuai
- [ ] Setup Row Level Security (RLS) jika diperlukan
- [ ] Backup database secara berkala
- [ ] Monitor usage di Supabase Dashboard
- [ ] Setup alerts untuk error di Supabase

