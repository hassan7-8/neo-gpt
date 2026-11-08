"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { authConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export function UserMenu() {
  const router = useRouter();
  // undefined = still checking, null = guest
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!authConfigured) return;
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null))
      .catch(() => setEmail(null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setEmail(s?.user?.email ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!authConfigured || email === undefined) return null;

  async function logOut() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  if (email === null) {
    return (
      <div className="flex items-center gap-2">
        <span className="anim-pop bg-butter/40 text-ink/70 hidden rounded-full px-3 py-1 text-xs font-semibold md:inline">
          Guest
        </span>
        <Link
          href="/auth?mode=login"
          className="press bg-paper ring-ink/5 rounded-xl px-3 py-2 text-sm font-medium ring-1"
        >
          Log in
        </Link>
        <Link
          href="/auth"
          className="press lift bg-mint text-ink ring-ink/5 rounded-xl px-3 py-2 text-sm font-semibold ring-1"
        >
          Sign up
        </Link>
      </div>
    );
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
