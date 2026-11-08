import { authConfigured } from "./config";
import { createClient } from "./server";

/**
 * For API routes. Returns a 401 Response when login is configured and the
 * caller is not signed in, otherwise null.
 */
export async function requireUser(): Promise<Response | null> {
  if (!authConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Please log in to use the chat.", { status: 401 });
  return null;
}
