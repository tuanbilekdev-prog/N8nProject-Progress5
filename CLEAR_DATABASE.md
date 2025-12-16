# Cara Hapus Data di Supabase Database

Ada 2 opsi untuk menghapus data:

## Opsi 1: Hapus Data Saja (Tabel Tetap Ada) ✅ DISARANKAN

Script ini hanya menghapus data, tabel tetap ada. Cocok jika ingin reset data tapi tetap pakai struktur yang sama.

### Langkah:
1. Buka **Supabase Dashboard → SQL Editor**
2. Copy seluruh isi file `supabase-clear-data.sql`
3. Paste ke SQL Editor
4. Klik **Run**
5. Selesai! Semua data terhapus, tapi tabel masih ada

### Yang Terhapus:
- ✅ Semua data di `users`
- ✅ Semua data di `accounts`
- ✅ Semua data di `sessions`
- ✅ Semua data di `verification_tokens`
- ✅ Semua data di `chat_sessions`
- ✅ Semua data di `chat_messages`

### Yang Tetap Ada:
- ✅ Struktur tabel
- ✅ Indexes
- ✅ Triggers
- ✅ Functions

## Opsi 2: Hapus Semua Tabel (Mulai dari Awal) ⚠️ EXTREME

Script ini menghapus SEMUA tabel dan struktur. Cocok jika ingin benar-benar mulai dari awal.

### Langkah:
1. Buka **Supabase Dashboard → SQL Editor**
2. Copy seluruh isi file `supabase-drop-tables.sql`
3. Paste ke SQL Editor
4. Klik **Run**
5. **PENTING:** Setelah itu, jalankan lagi `supabase-schema.sql` untuk membuat tabel baru

### Yang Terhapus:
- ❌ Semua tabel
- ❌ Semua data
- ❌ Semua indexes
- ❌ Semua triggers
- ❌ Semua functions

### Setelah Hapus:
Harus jalankan `supabase-schema.sql` lagi untuk membuat tabel baru.

## Rekomendasi

**Pakai Opsi 1** (hapus data saja) kecuali:
- Ingin ubah struktur tabel
- Ingin mulai benar-benar dari awal
- Ada masalah dengan struktur tabel

## Verifikasi Setelah Hapus

Jalankan query ini untuk cek apakah data sudah terhapus:

```sql
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM accounts) as accounts_count,
  (SELECT COUNT(*) FROM sessions) as sessions_count,
  (SELECT COUNT(*) FROM verification_tokens) as verification_tokens_count,
  (SELECT COUNT(*) FROM chat_sessions) as chat_sessions_count,
  (SELECT COUNT(*) FROM chat_messages) as chat_messages_count;
```

Semua harus return `0`.

## Catatan Penting

- ⚠️ **Backup dulu** jika data penting!
- ⚠️ Hapus data tidak bisa di-undo!
- ⚠️ Pastikan tidak ada aplikasi lain yang sedang pakai database saat hapus data

