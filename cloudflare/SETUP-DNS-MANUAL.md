# Setup DNS Records Manual untuk devai.sbs

## Masalah
DNS routing via `cloudflared tunnel route dns` membuat CNAME dengan nama salah karena tunnel login menggunakan domain yang berbeda.

## Solusi: Buat CNAME Records Manual di Cloudflare Dashboard

### STEP 1: Buka Cloudflare Dashboard
1. Login ke Cloudflare Dashboard
2. Pilih domain `devai.sbs`
3. Buka DNS → Records

### STEP 2: Hapus CNAME Records yang Salah (jika ada)
Hapus records dengan nama:
- `n8n.devai.sbs.devai.com` (jika ada)
- `webhook.devai.sbs.devai.com` (jika ada)

### STEP 3: Buat CNAME Records Baru
Tambahkan 2 CNAME records:

**Record 1:**
- Type: `CNAME`
- Name: `n8n`
- Target: `d33c3aec-40bc-4571-93f4-26afa64964bc.cfargotunnel.com`
- Proxy: ON (oranye)
- TTL: Auto

**Record 2:**
- Type: `CNAME`
- Name: `webhook`
- Target: `d33c3aec-40bc-4571-93f4-26afa64964bc.cfargotunnel.com`
- Proxy: ON (oranye)
- TTL: Auto

### STEP 4: Verifikasi
Setelah dibuat, records akan terlihat seperti:
- `n8n.devai.sbs` → `d33c3aec-40bc-4571-93f4-26afa64964bc.cfargotunnel.com` (Proxied)
- `webhook.devai.sbs` → `d33c3aec-40bc-4571-93f4-26afa64964bc.cfargotunnel.com` (Proxied)

## Setelah DNS Records Dibuat
1. Jalankan tunnel:
   ```powershell
   cd "D:\Kuliah\Semester 3\SJK\N8nProject\N8nProject-Progress5"
   cloudflared tunnel --config cloudflare/tunnel-config.yaml run devai-tunnel
   ```

2. Tunggu propagasi DNS (1-2 jam setelah nameserver ter-update)

3. Test akses:
   - `https://n8n.devai.sbs`
   - `https://webhook.devai.sbs`

