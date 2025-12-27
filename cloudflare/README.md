# Cloudflare Setup - devai.sbs

## 📁 File Struktur

- `tunnel-config.yaml` - Konfigurasi Cloudflare Tunnel
- `firewall-rules.md` - Dokumentasi Firewall Rules
- `START-ALL.ps1` - Script untuk start semua service (Docker + Tunnel)
- `START-WEBAPP.ps1` - Script untuk start WebApp Next.js
- `START-TUNNEL.ps1` - Script untuk start tunnel saja
- `README.md` - Dokumentasi ini

## 🚀 Quick Start

### Start Semua Service

```powershell
.\cloudflare\START-ALL.ps1
```

Script ini akan:
1. Start Docker containers (n8n + postgres)
2. Reset DNS ke default (DHCP/Auto)
3. Flush DNS cache
4. Start Cloudflare Tunnel (di window baru)

### Start WebApp

Untuk start Next.js WebApp:

```powershell
.\cloudflare\START-WEBAPP.ps1
```

**Catatan:** WebApp harus di-start terpisah karena berjalan di process terpisah.

### Start Tunnel Saja

Jika Docker sudah running:

```powershell
.\cloudflare\START-TUNNEL.ps1
```

Atau manual:

```powershell
cloudflared tunnel --config cloudflare/tunnel-config.yaml run devai-tunnel
```

## 🌐 URLs

- **n8n Dashboard**: https://n8n.devai.sbs
- **WebApp (Next.js)**: https://webhook.devai.sbs
- **n8n Webhook (Telegram Bot)**: https://n8n.devai.sbs/webhook/[workflow-id]

## 📋 Prerequisites

1. Docker Desktop running
2. `cloudflared` terinstall
3. Tunnel `devai-tunnel` sudah dibuat
4. DNS records sudah dikonfigurasi di Cloudflare

## 🔧 Troubleshooting

### Domain tidak bisa diakses
1. Pastikan Docker containers running: `docker ps`
2. Pastikan tunnel running (cek PowerShell window)
3. Cek DNS resolution: `Resolve-DnsName -Name n8n.devai.sbs`
4. Flush DNS: `ipconfig /flushdns`

### Tunnel tidak running
1. Cek tunnel config: `cloudflare/tunnel-config.yaml`
2. Cek credentials file: `C:\Users\lenovo\.cloudflared\d33c3aec-40bc-4571-93f4-26afa64964bc.json`
3. Test tunnel: `cloudflared tunnel info devai-tunnel`

