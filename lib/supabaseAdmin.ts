import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client
 * - Dùng SERVICE ROLE KEY
 * - Chỉ dùng trong server (API / cron / background)
 */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin env variables");
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
