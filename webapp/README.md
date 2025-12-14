# N8N WebApp dengan Authentication

Aplikasi Next.js dengan fitur chat AI dan autentikasi menggunakan NextAuth.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Buat file `.env.local` di folder `webapp` dengan konten berikut:

```env
# NextAuth Configuration (REQUIRED)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Optional - untuk Google login)
# Jika tidak diisi, tombol Google login tidak akan muncul
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# N8N Webhook URL (REQUIRED untuk fitur chat)
N8N_WEBHOOK_URL=your-n8n-webhook-url
```

### 3. Generate NEXTAUTH_SECRET

Untuk development, Anda bisa menggunakan secret key apapun. Untuk production, generate secret key yang aman:

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

Atau gunakan generator online: https://generate-secret.vercel.app/32

### 4. Setup Google OAuth (Optional)

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang ada
3. Enable Google+ API
4. Buat OAuth 2.0 Client ID
5. Tambahkan Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID dan Client Secret ke `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Login

### Demo Login
- **Username/Email:** Apapun (contoh: `user@example.com` atau `test123`)
- **Password:** `password`

### Google Login
Klik tombol "Login dengan Google" (hanya muncul jika Google OAuth sudah dikonfigurasi)

## Routes

- `/` - Redirect ke `/login`
- `/login` - Halaman login
- `/chat` - Halaman chat (protected, memerlukan login)

## Features

- ✅ Login dengan username/password
- ✅ Login dengan Google OAuth
- ✅ Protected routes dengan middleware
- ✅ Session management
- ✅ Dark/Light mode
- ✅ Responsive design

