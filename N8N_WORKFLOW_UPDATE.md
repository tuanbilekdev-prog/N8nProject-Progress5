# Update Workflow n8n untuk Chat Memory Per User

## Masalah
Saat ini semua user menggunakan chat memory yang sama karena `sessionKey` di workflow menggunakan nilai statis `"web-app"`.

## Solusi
Update workflow n8n untuk menggunakan `userId` atau kombinasi `userId-chatId` sebagai session key.

## Langkah-langkah Update Workflow

### 1. Update Node "Postgres Chat Memory"

Di workflow "Progress 5 + 4, webhook", cari node **"Postgres Chat Memory"** dan update konfigurasinya:

**Sebelum:**
```json
{
  "sessionIdType": "customKey",
  "sessionKey": "web-app"
}
```

**Sesudah:**
```json
{
  "sessionIdType": "customKey",
  "sessionKey": "={{ $json.body.userId || $json.userId || 'default' }}"
}
```

Atau jika ingin memisahkan per chat session juga:
```json
{
  "sessionIdType": "customKey",
  "sessionKey": "={{ ($json.body.userId || $json.userId || 'default') + '-' + ($json.body.chatId || $json.chatId || 'default') }}"
}
```

### 2. Update Node "Window Buffer Memory" (Opsional)

Node ini sudah menggunakan `chatId`, tapi pastikan juga menggunakan `userId`:

**Saat ini:**
```json
{
  "sessionKey": "={{ $json.body.chatId }}"
}
```

**Disarankan:**
```json
{
  "sessionKey": "={{ ($json.body.userId || $json.userId || 'default') + '-' + ($json.body.chatId || $json.chatId || 'default') }}"
}
```

### 3. Verifikasi Data yang Diterima

Pastikan webhook menerima data dengan format:
```json
{
  "question": "pertanyaan user",
  "message": "pertanyaan user",
  "text": "pertanyaan user",
  "query": "pertanyaan user",
  "userId": "user-id-dari-nextauth",
  "chatId": "chat-id-dari-webapp",
  "body": {
    "message": "pertanyaan user",
    "text": "pertanyaan user",
    "chatId": "chat-id-dari-webapp",
    "userId": "user-id-dari-nextauth"
  }
}
```

## Catatan Penting

1. **Database Schema**: Pastikan sudah menjalankan `supabase-schema.sql` yang sudah diupdate dengan kolom `user_id` di table `n8n_chat_histories`.

2. **Testing**: Setelah update workflow:
   - Test dengan 2 user berbeda
   - Pastikan chat memory mereka terpisah
   - Pastikan AI mengingat konteks per user dengan benar

3. **Migration Data Lama**: Jika ada data lama di `n8n_chat_histories` tanpa `user_id`, data tersebut akan tetap ada tapi tidak terikat ke user manapun. Pertimbangkan untuk:
   - Menghapus data lama, atau
   - Migrate data lama ke user tertentu jika diperlukan

## Troubleshooting

### Chat memory masih sama untuk semua user
- Pastikan `sessionKey` di workflow sudah menggunakan `userId`
- Pastikan webapp mengirim `userId` di request body
- Check di Supabase apakah `n8n_chat_histories` memiliki `user_id` yang berbeda per user

### Error "Could not find the table"
- Pastikan sudah menjalankan `supabase-schema.sql` di Supabase SQL Editor
- Pastikan table `n8n_chat_histories` sudah dibuat dengan kolom `user_id`

