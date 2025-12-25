# Update Environment Variables

## Update webapp/.env.local

File `webapp/.env.local` perlu diupdate untuk menggunakan URL Cloudflare.

### Perubahan yang diperlukan:

Ganti `N8N_WEBHOOK_URL` dari:
```env
N8N_WEBHOOK_URL=https://unemigrating-visionally-jeffery.ngrok-free.dev/webhook/bc3934df-8d10-48df-9960-f0db1e806328
```

Menjadi:
```env
N8N_WEBHOOK_URL=https://webhook.devai.com/webhook/bc3934df-8d10-48df-9960-f0db1e806328
```

**Catatan**: Sesuaikan path webhook (`/webhook/bc3934df-...`) dengan endpoint yang digunakan di workflow n8n Anda.

### File lengkap contoh:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# N8N Webhook URL (Cloudflare)
N8N_WEBHOOK_URL=https://webhook.devai.com/webhook/bc3934df-8d10-48df-9960-f0db1e806328

# Supabase Database (jika digunakan)
SUPABASE_DB_HOST=your-supabase-host.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.xxxxx
SUPABASE_DB_PASSWORD=your-supabase-password
```

Setelah update, restart WebApp development server:
```powershell
# Di folder webapp
npm run dev
```

