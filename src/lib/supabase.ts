import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Debug logging for production - Force rebuild to pick up new env vars
if (typeof window !== "undefined") {
  console.log("🔧 [SUPABASE DEBUG] URL:", supabaseUrl);
  console.log("🔧 [SUPABASE DEBUG] Key length:", supabaseAnonKey?.length);
  console.log("🔧 [SUPABASE DEBUG] Should be yhhhscrzgcbuhhmvvipc project");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
