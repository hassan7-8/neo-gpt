"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InfoIcon, LogOutIcon, UserRoundIcon } from "lucide-react";
import { authConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { profileFromUser, type Profile } from "@/lib/profile";
import { Avatar } from "./avatar";

export function UserMenu() {
  const router = useRouter();
  // undefined = still checking, null = guest
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authConfigured) return;
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setProfile(profileFromUser(data.user)))
      .catch(() => setProfile(null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setProfile(profileFromUser(s?.user)),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!authConfigured || profile === undefined) return null;

  async function logOut() {
    await createClient().auth.signOut();
    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  if (profile === null) {
    return (
      <div className="flex items-center gap-2">
        <span className="bg-butter/50 text-ink/70 hidden rounded-full px-3 py-1 text-xs font-semibold md:inline">
          Guest
        </span>
        <Link
          href="/auth?mode=login"
          className="press bg-paper ring-ink/10 rounded-xl px-3 py-2 text-sm font-medium ring-1"
        >
          Log in
        </Link>
        <Link
          href="/auth"
          className="press lift bg-mint text-ink ring-gold-deep/30 rounded-xl px-3 py-2 text-sm font-semibold ring-1"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-ink/5";

  return (
    <div className="relative" ref={box}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        className="press flex items-center gap-2 rounded-full p-0.5 pr-3 transition-colors hover:bg-ink/5"
      >
        <Avatar name={profile.name} color={profile.color} url={profile.avatarUrl} size={36} />
        <span className="hidden max-w-[10rem] truncate text-sm font-semibold sm:inline">{profile.name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="anim-pop bg-paper ring-ink/10 absolute right-0 z-30 mt-2 w-64 rounded-2xl p-2 shadow-xl ring-1"
        >
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar name={profile.name} color={profile.color} url={profile.avatarUrl} size={44} />
            <div className="min-w-0">
              <p className="font-display truncate text-base font-semibold">{profile.name}</p>
              <p className="text-ink/55 truncate text-xs">{profile.email}</p>
            </div>
          </div>
          <div className="gold-hairline my-1" />
          <Link href="/profile" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            <UserRoundIcon className="size-4" /> Edit profile
          </Link>
          <Link href="/about" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            <InfoIcon className="size-4" /> About
          </Link>
          <button role="menuitem" onClick={() => void logOut()} className={itemClass}>
            <LogOutIcon className="size-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
