# Cloudflare Firewall Rules

## Rule 1: Block Non-GET-POST Methods
- **Purpose**: Blokir semua HTTP method selain GET dan POST
- **Field**: Request Method
- **Operator**: is not in
- **Value**: GET, POST
- **Action**: Block

## Rule 2: Allow Only Vercel and Telegram
- **Purpose**: Challenge request yang bukan dari Vercel atau Telegram IP ranges
- **Field**: Custom filter expression
- **Expression**: 
  ```
  (http.request.method eq "POST") and 
  (not ip.src in {149.154.160.0/20 91.108.4.0/22}) and
  (not http.request.headers["x-forwarded-for"] contains "vercel")
  ```
- **Telegram IP Ranges**: 
  - 149.154.160.0/20
  - 91.108.4.0/22
- **Action**: Challenge

## Rule 3: Rate Limiting Webhook (Optional)
- **Purpose**: Limit request rate untuk endpoint webhook
- **Path**: /webhook/*
- **Rate**: 10 requests per minute
- **Action**: Block

