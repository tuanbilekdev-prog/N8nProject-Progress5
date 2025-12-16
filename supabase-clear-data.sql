-- ============================================
-- Script untuk Hapus Semua Data di Supabase
-- ============================================
-- PERINGATAN: Script ini akan menghapus SEMUA data!
-- Backup dulu jika perlu!
-- Jalankan di Supabase SQL Editor

-- Hapus data dari semua tabel (dalam urutan yang benar karena foreign key)
-- Urutan: child tables dulu, baru parent tables

-- 1. Hapus chat messages (child dari chat_sessions)
DELETE FROM chat_messages;

-- 2. Hapus chat sessions (child dari users)
DELETE FROM chat_sessions;

-- 3. Hapus accounts (child dari users)
DELETE FROM accounts;

-- 4. Hapus sessions (child dari users)
DELETE FROM sessions;

-- 5. Hapus verification tokens
DELETE FROM verification_tokens;

-- 6. Hapus users (parent table, hapus terakhir)
DELETE FROM users;

-- ============================================
-- Opsi: Reset Auto-increment/Sequence (jika ada)
-- ============================================
-- Jika ada sequence yang perlu di-reset, uncomment:
-- ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS chat_sessions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS chat_messages_id_seq RESTART WITH 1;

-- ============================================
-- Verifikasi: Cek jumlah data setelah delete
-- ============================================
-- Jalankan query ini untuk cek apakah data sudah terhapus:
-- SELECT 
--   (SELECT COUNT(*) FROM users) as users_count,
--   (SELECT COUNT(*) FROM accounts) as accounts_count,
--   (SELECT COUNT(*) FROM sessions) as sessions_count,
--   (SELECT COUNT(*) FROM verification_tokens) as verification_tokens_count,
--   (SELECT COUNT(*) FROM chat_sessions) as chat_sessions_count,
--   (SELECT COUNT(*) FROM chat_messages) as chat_messages_count;

