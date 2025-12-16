# Fix "new row violates row-level security policy" Error

Error ini terjadi karena Row Level Security (RLS) aktif di Supabase tapi tidak ada policy yang mengizinkan insert.

## Solusi Cepat (Disable RLS untuk Development)

1. Buka **Supabase Dashboard → SQL Editor**
2. Copy dan paste script berikut:

```sql
-- Disable RLS untuk development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
```

3. Klik **Run**
4. Coba registrasi lagi

## Atau Gunakan Service Role Key (Lebih Aman untuk Production)

Jika ingin tetap pakai RLS tapi bypass untuk aplikasi:

1. Buka **Supabase Dashboard → Settings → API**
2. Copy **service_role key** (bukan anon key!)
3. Update `.env.local`:

```env
# Untuk server-side operations, gunakan service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service_role key)
```

4. Update `webapp/lib/supabaseClient.ts` untuk pakai service_role key di server-side

## Catatan

- **Disable RLS**: Mudah untuk development, tapi kurang aman
- **Service Role Key**: Lebih aman, bypass RLS untuk aplikasi kamu
- **RLS Policy**: Paling aman, tapi perlu setup policy yang benar

Untuk development, disable RLS dulu. Untuk production, pakai service_role key atau setup RLS policy yang benar.

