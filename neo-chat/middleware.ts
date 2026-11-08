import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip API routes (they check the session themselves), static files and
  // the Google Search Console verification file.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|google[a-z0-9]+\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
