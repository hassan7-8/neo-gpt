import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ResetForm } from "@/components/auth/reset-form";
import { getUser } from "@/lib/supabase/get-user";

export const metadata: Metadata = { title: "Choose a new password — Cheap Mind AI" };

export const dynamic = "force-dynamic";

export default async function ResetPage() {
  const { configured, user } = await getUser();
  if (!configured) redirect("/auth");
  if (!user) redirect("/auth?error=" + encodeURIComponent("That reset link has expired. Request a new one."));

  return (
    <div className="bg-cream text-ink min-h-screen px-5 py-6 sm:px-8">
      <header className="mx-auto max-w-4xl">
        <Logo />
      </header>
      <div className="mx-auto mt-14 max-w-md">
        <ResetForm />
      </div>
    </div>
  );
}
