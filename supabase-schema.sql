-- ============================================
-- Supabase Schema - Clean Reset
-- ============================================
-- Script ini akan:
-- 1. Menghapus semua table yang ada
-- 2. Membuat table users (untuk NextAuth)
-- 3. Membuat table chat history (untuk webapp dan n8n)
-- ============================================

-- ============================================
-- 1. HAPUS SEMUA TABLE YANG ADA
-- ============================================

-- Hapus table dengan CASCADE untuk menghapus dependencies
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS n8n_chat_histories CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Hapus functions dan triggers yang mungkin ada
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- 2. TABLE USERS (untuk NextAuth)
-- ============================================

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  image TEXT,
  password TEXT, -- hashed password untuk credentials login
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TABLE ACCOUNTS (untuk OAuth providers)
-- ============================================

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

-- ============================================
-- 4. TABLE SESSIONS (untuk NextAuth)
-- ============================================

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

-- ============================================
-- 5. TABLE VERIFICATION_TOKENS (untuk email verification)
-- ============================================

CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================================
-- 6. TABLE CHAT_SESSIONS (untuk webapp chat history)
-- ============================================

CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. TABLE CHAT_MESSAGES (untuk webapp chat messages)
-- ============================================

CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'bot', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_index INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- 8. TABLE N8N_CHAT_HISTORIES (untuk n8n Postgres Chat Memory)
-- ============================================
-- Struktur ini sesuai dengan yang digunakan n8n Postgres Chat Memory node
-- message disimpan sebagai JSONB untuk fleksibilitas
-- user_id ditambahkan untuk memisahkan chat memory per user

CREATE TABLE n8n_chat_histories (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  message JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. INDEXES untuk performa
-- ============================================

-- Indexes untuk users
CREATE INDEX idx_users_email ON users(email);

-- Indexes untuk accounts
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_provider ON accounts(provider, provider_account_id);

-- Indexes untuk sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires);

-- Indexes untuk chat_sessions
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at);

-- Indexes untuk chat_messages
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_order ON chat_messages(session_id, order_index);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Indexes untuk n8n_chat_histories
CREATE INDEX idx_n8n_chat_histories_session_id ON n8n_chat_histories(session_id);
CREATE INDEX idx_n8n_chat_histories_user_id ON n8n_chat_histories(user_id);
CREATE INDEX idx_n8n_chat_histories_user_session ON n8n_chat_histories(user_id, session_id);
CREATE INDEX idx_n8n_chat_histories_created_at ON n8n_chat_histories(created_at);

-- ============================================
-- 10. FUNCTIONS untuk auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk users
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at 
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS) - DISABLED by default
-- ============================================
-- Uncomment baris di bawah jika ingin mengaktifkan RLS
-- Pastikan untuk membuat policies yang sesuai sebelum mengaktifkan

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SELESAI
-- ============================================
-- Schema sudah siap digunakan!
-- Table yang dibuat:
-- 1. users - untuk NextAuth authentication
-- 2. accounts - untuk OAuth providers
-- 3. sessions - untuk NextAuth sessions
-- 4. verification_tokens - untuk email verification
-- 5. chat_sessions - untuk webapp chat sessions
-- 6. chat_messages - untuk webapp chat messages
-- 7. n8n_chat_histories - untuk n8n Postgres Chat Memory
