import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Debug logging for production - Force rebuild to pick up corrected API key
if (typeof window !== "undefined") {
  console.log("🔧 [SUPABASE DEBUG] URL:", supabaseUrl);
  console.log("🔧 [SUPABASE DEBUG] Key length:", supabaseAnonKey?.length);
  console.log("🔧 [SUPABASE DEBUG] Should be yhhhscrzgcbuhhmvvipc project");
  console.log("🔧 [SUPABASE DEBUG] Key length should be 208 chars, not 66");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
