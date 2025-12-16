// Helper untuk mendapatkan Supabase connection details
// Mencoba berbagai format hostname yang mungkin

export function getSupabaseConnectionConfig() {
  const ref = process.env.SUPABASE_REF || extractRefFromHost(process.env.SUPABASE_DB_HOST || "");
  const region = process.env.SUPABASE_REGION || "ap-southeast-1"; // Default region
  
  // Coba berbagai format hostname
  const possibleHosts = [
    // Format direct connection
    `db.${ref}.supabase.co`,
    // Format pooler (session mode - port 5432)
    `aws-0-${region}.pooler.supabase.com`,
    // Format pooler (transaction mode - port 6543)
    `aws-0-${region}.pooler.supabase.com`,
    // Format alternatif
    `${ref}.supabase.co`,
  ];

  return {
    possibleHosts,
    ref,
    region,
    port: process.env.SUPABASE_DB_PORT || "5432",
    database: process.env.SUPABASE_DB_NAME || "postgres",
    user: process.env.SUPABASE_DB_USER || `postgres.${ref}`,
    password: process.env.SUPABASE_DB_PASSWORD || "",
  };
}

function extractRefFromHost(host: string): string {
  // Extract reference ID from hostname
  // db.xxxxx.supabase.co -> xxxxx
  const match = host.match(/db\.([^.]+)\.supabase\.co/);
  if (match) return match[1];
  
  // xxxxx.supabase.co -> xxxxx
  const match2 = host.match(/([^.]+)\.supabase\.co/);
  if (match2) return match2[1];
  
  return "";
}

