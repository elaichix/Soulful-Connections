import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/chat";

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=auth_not_configured`);
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Validate redirect to prevent open redirect attacks
      const redirectUrl = next.startsWith("/") ? `${origin}${next}` : `${origin}/chat`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
