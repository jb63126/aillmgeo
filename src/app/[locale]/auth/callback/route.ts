import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to dashboard on successful authentication
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Redirect to login page on error
  return NextResponse.redirect(`${origin}/login`);
}
