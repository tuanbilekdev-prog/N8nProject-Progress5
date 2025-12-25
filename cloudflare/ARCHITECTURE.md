# Arsitektur Integrasi Cloudflare

## Overview
Proyek ini menggunakan Cloudflare untuk DNS management, tunneling, dan security layer menggantikan Ngrok.

## Komponen

### 1. Cloudflare DNS
- Domain: devai.com
- Subdomain:
  - `n8n.devai.com` → n8n instance (localhost:5678)
  - `webhook.devai.com` → WebApp webhook endpoint

### 2. Cloudflare Tunnel
- Tunnel Name: `n8n-tunnel`
- Tunnel ID: `901c4410-18be-4f33-b6a8-1be86b2dd122`
- Protocol: HTTP/HTTPS
- Routing:
  - n8n subdomain → localhost:5678
  - webhook subdomain → WebApp (localhost:3000 atau Vercel)

### 3. Security Layer
- Firewall Rules:
  1. Block non-GET/POST methods
  2. Allow only Vercel and Telegram IPs (untuk webhook)
  3. Rate limiting untuk webhook endpoints (optional)

## Flow Request

### Request ke n8n:
```
User → Cloudflare DNS → Cloudflare Proxy (SSL/TLS) → Firewall Rules → Cloudflare Tunnel → localhost:5678 (n8n)
```

### Request ke Webhook:
```
Telegram/Vercel → Cloudflare DNS → Cloudflare Proxy (SSL/TLS) → Firewall Rules → Cloudflare Tunnel → WebApp → n8n Webhook
```

## Keuntungan vs Ngrok
1. **Stability**: URL tetap, tidak berubah setiap restart
2. **Security**: Built-in DDoS protection, WAF, firewall rules
3. **Performance**: CDN caching, global edge network
4. **Cost**: Free plan cukup untuk kebutuhan development
5. **Monitoring**: Built-in analytics dan logging

## Maintenance
- Tunnel harus running terus menerus (install sebagai service atau biarkan terminal terbuka)
- Monitor firewall events untuk security threats
- Update firewall rules sesuai kebutuhan
- SSL certificate auto-renew oleh Cloudflare

## Troubleshooting

### Tunnel tidak connect
- Pastikan `cloudflared tunnel login` sudah dijalankan
- Cek file credential di `.cloudflared/`
- Pastikan tunnel ID benar di config

### DNS tidak resolve
- Tunggu propagasi DNS (bisa sampai 48 jam)
- Cek nameserver sudah diupdate di registrar
- Pastikan proxy ON (oranye)

### Firewall block legitimate requests
- Cek IP ranges Telegram dan Vercel
- Tambahkan exception di firewall rules
- Monitor Security Events untuk debug

### n8n tidak accessible
- Pastikan n8n container running (`docker-compose up -d`)
- Cek tunnel config, pastikan service URL benar
- Test localhost:5678 langsung

