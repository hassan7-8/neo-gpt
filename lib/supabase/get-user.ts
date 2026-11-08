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

/** For routes that need a real account (e.g. image generation). */
export async function requireUser(): Promise<Response | null> {
  const { configured, user } = await getUser();
  if (configured && !user) {
    return new Response("Please log in or sign up to use this feature.", { status: 401 });
  }
  return null;
}
