// Script untuk test berbagai format user Supabase
// Jalankan dengan: node test-supabase-user.js

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const ref = process.env.SUPABASE_REF || 'ncruaxieqaitftcmuvmf';
const region = process.env.SUPABASE_REGION || 'ap-southeast-1';
const password = process.env.SUPABASE_DB_PASSWORD;

// Format user yang akan di-test
const userFormats = [
  `postgres.${ref}`,
  'postgres',
  ref,
];

// Format host yang akan di-test
const hostFormats = [
  `aws-0-${region}.pooler.supabase.com`,
  `db.${ref}.supabase.co`,
];

console.log('Testing Supabase connection with different user formats...\n');

async function testConnection(host, user, port = 5432) {
  const pool = new Pool({
    host,
    port,
    database: 'postgres',
    user,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    const result = await pool.query('SELECT NOW(), current_user');
    console.log(`✅ SUCCESS with host: ${host}, user: ${user}`);
    console.log(`   Current time: ${result.rows[0].now}`);
    console.log(`   Current user: ${result.rows[0].current_user}\n`);
    await pool.end();
    return true;
  } catch (error) {
    console.log(`❌ FAILED with host: ${host}, user: ${user}`);
    console.log(`   Error: ${error.message}\n`);
    await pool.end();
    return false;
  }
}

async function runTests() {
  for (const host of hostFormats) {
    for (const user of userFormats) {
      const success = await testConnection(host, user);
      if (success) {
        console.log(`\n🎉 Working configuration found!`);
        console.log(`Add to .env.local:`);
        console.log(`SUPABASE_DB_HOST=${host}`);
        console.log(`SUPABASE_DB_USER=${user}`);
        return;
      }
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n❌ No working configuration found. Please check:');
  console.log('1. SUPABASE_DB_PASSWORD is correct');
  console.log('2. SUPABASE_REF is correct');
  console.log('3. SUPABASE_REGION is correct');
  console.log('4. Project is still active in Supabase');
}

runTests().catch(console.error);

