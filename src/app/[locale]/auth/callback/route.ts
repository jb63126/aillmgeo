import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect = requestUrl.searchParams.get("redirect");
  const origin = requestUrl.origin;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to specified URL or default dashboard
      const redirectUrl = redirect
        ? decodeURIComponent(redirect)
        : "/en/dashboard";
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  // Redirect to login page on error
  return NextResponse.redirect(`${origin}/en/login`);
}
