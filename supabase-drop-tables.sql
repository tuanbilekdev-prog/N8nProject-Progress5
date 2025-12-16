-- ============================================
-- Script untuk Hapus SEMUA TABEL (EXTREME!)
-- ============================================
-- PERINGATAN: Script ini akan MENGHAPUS SEMUA TABEL!
-- Semua data dan struktur tabel akan hilang!
-- Hanya jalankan jika benar-benar ingin mulai dari awal!

-- Hapus tabel dalam urutan yang benar (child dulu, parent kemudian)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Hapus function jika ada
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Hapus trigger jika ada
-- (Trigger akan otomatis terhapus saat tabel dihapus)

-- ============================================
-- Setelah menjalankan script ini:
-- 1. Jalankan lagi supabase-schema.sql untuk membuat tabel baru
-- 2. Semua data akan hilang dan mulai dari awal
-- ============================================

