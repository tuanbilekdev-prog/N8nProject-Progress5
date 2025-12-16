-- Fix Row Level Security untuk allow insert/select
-- Jalankan di Supabase SQL Editor

-- Disable RLS untuk development (atau buat policy yang lebih spesifik)
-- Opsi 1: Disable RLS (untuk development saja)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Opsi 2: Atau buat policy yang allow semua untuk anon users (untuk development)
-- Uncomment jika ingin pakai RLS tapi allow semua untuk development

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for anon users" ON users
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for anon users" ON accounts
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for anon users" ON sessions
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for anon users" ON verification_tokens
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for anon users" ON chat_sessions
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for anon users" ON chat_messages
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

