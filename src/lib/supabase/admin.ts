import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types";

/**
 * Creates a Supabase client with the service role key.
 * This bypasses RLS — use ONLY in server actions / API routes.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
