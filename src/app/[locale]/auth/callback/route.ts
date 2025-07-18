import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect = requestUrl.searchParams.get("redirect");
  const origin = requestUrl.origin;

  // Comprehensive debugging
  console.log("🔍 [AUTH CALLBACK] Starting auth callback process");
  console.log("🔍 [AUTH CALLBACK] Full URL:", request.url);
  console.log("🔍 [AUTH CALLBACK] Code parameter:", code);
  console.log("🔍 [AUTH CALLBACK] Redirect parameter:", redirect);
  console.log("🔍 [AUTH CALLBACK] Origin:", origin);
  console.log(
    "🔍 [AUTH CALLBACK] All search params:",
    Object.fromEntries(requestUrl.searchParams)
  );

  // Create a server client that can write cookies
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  if (code) {
    console.log(
      "🔍 [AUTH CALLBACK] Code found, attempting to exchange for session"
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log("🔍 [AUTH CALLBACK] Session exchange successful");
      console.log(
        "🔍 [AUTH CALLBACK] Session data:",
        data?.session ? "Session exists" : "No session"
      );
      console.log(
        "🔍 [AUTH CALLBACK] User:",
        data?.user ? `User ID: ${data.user.id}` : "No user"
      );

      // Redirect to specified URL or default dashboard
      const redirectUrl = redirect
        ? decodeURIComponent(redirect)
        : "/en/dashboard";
      console.log("🔍 [AUTH CALLBACK] Redirecting to:", redirectUrl);
      console.log(
        "🔍 [AUTH CALLBACK] Full redirect URL:",
        `${origin}${redirectUrl}`
      );
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    } else {
      console.error("🔍 [AUTH CALLBACK] Session exchange failed:", error);
      console.error("🔍 [AUTH CALLBACK] Error details:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
    }
  } else {
    console.error("🔍 [AUTH CALLBACK] No code parameter found");
  }

  // Redirect to login page on error
  console.log("🔍 [AUTH CALLBACK] Redirecting to login page due to error");
  return NextResponse.redirect(`${origin}/en/login`);
}
