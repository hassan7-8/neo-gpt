import { NextResponse } from "next/server";
import { authConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

// Landing point for Google / Facebook sign-in and email confirmation links.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/chat";
  // Only allow same-site relative redirects.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/chat";

  if (authConfigured && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  const description = searchParams.get("error_description");
  const url = new URL("/auth", origin);
  url.searchParams.set("error", description ?? "Sign-in failed. Please try again.");
  return NextResponse.redirect(url);
}
