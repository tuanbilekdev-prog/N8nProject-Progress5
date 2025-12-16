// Script untuk test koneksi Supabase
// Jalankan dengan: node test-supabase-connection.js

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST,
  port: parseInt(process.env.SUPABASE_DB_PORT || "5432"),
  database: process.env.SUPABASE_DB_NAME || "postgres",
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('Testing connection to:', process.env.SUPABASE_DB_HOST);
console.log('User:', process.env.SUPABASE_DB_USER);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('\n💡 Tips:');
    console.error('1. Pastikan hostname benar (format: db.[ref].supabase.co)');
    console.error('2. Coba gunakan connection pooler: aws-0-[region].pooler.supabase.com');
    console.error('3. Cek di Supabase Dashboard → Settings → Database untuk connection string');
  } else {
    console.log('✅ Connection successful!');
    console.log('Current time:', res.rows[0].now);
  }
  pool.end();
});

