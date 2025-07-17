import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Debug logging for production
if (typeof window !== "undefined") {
  console.log("🔧 [SUPABASE DEBUG] URL:", supabaseUrl);
  console.log("🔧 [SUPABASE DEBUG] Key length:", supabaseAnonKey?.length);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
