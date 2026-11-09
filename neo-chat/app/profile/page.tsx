import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ProfileForm } from "@/components/auth/profile-form";
import { getUser } from "@/lib/supabase/get-user";
import { profileFromUser } from "@/lib/profile";

export const metadata: Metadata = { title: "Your profile — Cheap Mind AI" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { configured, user } = await getUser();
  if (!configured) redirect("/chat");
  const profile = profileFromUser(user);
  if (!profile) redirect("/auth?mode=login");

  return (
    <div className="bg-cream text-ink min-h-screen px-5 py-6 sm:px-8">
      <header className="mx-auto flex max-w-2xl items-center justify-between">
        <Logo />
        <Link href="/chat" className="press bg-paper ring-ink/10 rounded-xl px-4 py-2 text-sm font-medium ring-1">
          ← Back to chat
        </Link>
      </header>
      <div className="mx-auto mt-10 max-w-2xl">
        <h1 className="font-display mb-6 text-4xl font-semibold">Your profile</h1>
        <ProfileForm initial={profile} />
      </div>
    </div>
  );
}
