import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { AuthForm } from "@/components/auth/auth-form";
import { authConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Log in or sign up — Cheap Mind AI",
  description: "Create a free Cheap Mind AI account in seconds and start chatting instantly.",
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { error, mode } = await searchParams;

  if (authConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/chat");
  }

  return (
    <div className="bg-cream text-ink min-h-screen px-5 py-6 sm:px-8">
      <header className="mx-auto max-w-4xl">
        <Logo />
      </header>
      <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-10 lg:flex-row lg:items-stretch">
        <div className="w-full lg:w-1/2">
          <div className="anim-slideup bg-coral/10 text-coral ring-coral/25 mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1">
            <span className="bg-coral size-2 rounded-full" />
            {mode === "login" ? "Welcome back" : "Welcome"}
          </div>
          <h1
            className="anim-slideup font-display text-balance text-4xl font-semibold leading-none sm:text-5xl"
            style={{ animationDelay: "80ms" }}
          >
            {mode === "login" ? (
              <>
                Log in.
                <br />
                Pick up the thread.
              </>
            ) : (
              <>
                Sign up. Chat
                <br />
                in 10 seconds.
              </>
            )}
          </h1>
          <p
            className="anim-slideup text-ink/70 mt-5 max-w-[38ch] text-pretty"
            style={{ animationDelay: "160ms" }}
          >
            No credit card, no catch. Just a fast brain that costs pennies.
          </p>
          <div
            className="anim-slideup text-ink/70 mt-6 space-y-2 text-sm font-medium"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex items-center gap-2">
              <span className="bg-mint size-2 rounded-full" />
              Free tier forever
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-sky size-2 rounded-full" />
              Instant answers
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          {authConfigured ? (
            <AuthForm initialError={error} initialMode={mode === "login" ? "login" : "signup"} />
          ) : (
            <div className="bg-paper shadow-pop-sm ring-ink/5 rounded-3xl p-6 text-sm ring-1">
              <p className="font-display text-lg font-semibold">Login isn&apos;t set up yet</p>
              <p className="text-ink/70 mt-2">
                Add <code className="bg-ink/5 rounded px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="bg-ink/5 rounded px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to the
                environment variables, then redeploy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
