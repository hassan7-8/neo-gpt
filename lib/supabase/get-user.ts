import { authConfigured } from "./config";
import { createClient } from "./server";

/** Server-side: who is calling? `configured` is false until Supabase is set up. */
export async function getUser() {
  if (!authConfigured) return { configured: false as const, user: null };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { configured: true as const, user };
}

/**
 * Fast check for API routes: verifies the login cookie locally (no network round
 * trip to Supabase when the project uses signing keys), so replies start sooner.
 */
export async function getAuth() {
  if (!authConfigured) return { configured: false as const, signedIn: false };
  const supabase = await createClient();
  try {
    const { data } = await supabase.auth.getClaims();
    return { configured: true as const, signedIn: Boolean(data?.claims?.sub) };
  } catch {
    return { configured: true as const, signedIn: false };
  }
}

/** For routes that need a real account (e.g. image generation). */
export async function requireUser(): Promise<Response | null> {
  const { configured, signedIn } = await getAuth();
  if (configured && !signedIn) {
    return new Response("Please log in or sign up to use this feature.", { status: 401 });
  }
  return null;
}
