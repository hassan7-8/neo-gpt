"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { authConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export function UserMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!authConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setEmail(s?.user?.email ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!authConfigured || !email) return null;

  async function logOut() {
    await createClient().auth.signOut();
    router.replace("/auth");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <span className="bg-butter/40 text-ink/70 hidden max-w-[14rem] truncate rounded-full px-3 py-1 text-xs font-semibold sm:inline">
        {email}
      </span>
      <button
        onClick={() => void logOut()}
        className="press bg-ink/5 ring-ink/5 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium ring-1"
      >
        <LogOutIcon className="size-4" />
        Log out
      </button>
    </div>
  );
}
