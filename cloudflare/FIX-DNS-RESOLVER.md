# Fix DNS Resolver untuk Akses Domain

## Masalah
DNS resolver lokal (`csp1.zte.com.cn`) belum bisa resolve domain `devai.sbs`, padahal dengan Google DNS (8.8.8.8) sudah bisa resolve.

## Solusi: Ganti DNS Resolver Windows ke Google DNS

### STEP 1: Buka Network Settings
1. Klik kanan network icon di system tray
2. Pilih "Open Network & Internet settings"
3. Klik "Change adapter options"
4. Klik kanan adapter yang aktif (Wi-Fi atau Ethernet)
5. Pilih "Properties"

### STEP 2: Ganti DNS Server
1. Scroll dan pilih "Internet Protocol Version 4 (TCP/IPv4)"
2. Klik "Properties"
3. Pilih "Use the following DNS server addresses"
4. Isi:
   - Preferred DNS server: `8.8.8.8`
   - Alternate DNS server: `8.8.4.4`
5. Klik "OK"
6. Klik "OK" lagi

### STEP 3: Clear DNS Cache
Jalankan di PowerShell:
```powershell
ipconfig /flushdns
```

### STEP 4: Test DNS Resolution
```powershell
nslookup n8n.devai.sbs
```

Seharusnya sekarang bisa resolve.

## Alternatif: Gunakan Browser dengan DNS berbeda
Beberapa browser menggunakan DNS resolver sendiri:
- Chrome: Settings → Privacy and security → Security → Use secure DNS → dengan custom provider (Google)

## Catatan
- DNS resolver lokal mungkin di-restrict oleh network administrator
- Ganti ke Google DNS (8.8.8.8) biasanya lebih cepat update
- Setelah ganti DNS, clear cache dan test lagi

