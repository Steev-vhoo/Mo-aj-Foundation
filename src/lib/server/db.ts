import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SECRET_KEY } from 'astro:env/server';

let client: SupabaseClient | null | undefined;

/** Server-only Supabase client using the secret key, or null if Supabase isn't configured yet. */
export function getDb(): SupabaseClient | null {
  if (client === undefined) {
    client =
      SUPABASE_URL && SUPABASE_SECRET_KEY
        ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          })
        : null;
  }
  return client;
}
