import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseInstance && supabaseUrl && supabaseKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
};

export default getSupabaseClient;