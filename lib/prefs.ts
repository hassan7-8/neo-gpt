import { createClient } from "@/lib/supabase/client";
import { authConfigured } from "@/lib/supabase/config";

/** Settings saved on the user's account, so they follow them to every phone and computer. */
export async function loadPrefs(): Promise<Record<string, unknown>> {
  if (!authConfigured) return {};
  try {
    const { data } = await createClient().auth.getUser();
    return (data.user?.user_metadata ?? {}) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function savePref(key: string, value: unknown) {
  if (!authConfigured) return;
  try {
    const sb = createClient();
    const { data } = await sb.auth.getSession();
    if (data.session) await sb.auth.updateUser({ data: { [key]: value } });
  } catch {
    /* best effort */
  }
}
