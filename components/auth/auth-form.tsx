"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppleIcon, GoogleIcon, MicrosoftIcon } from "./provider-icons";

type Provider = "google" | "azure" | "apple";
type Notice = { kind: "error" | "info"; text: string } | null;

const PROVIDERS: { id: Provider; label: string; icon: React.ReactNode }[] = [
  { id: "google", label: "Google", icon: <GoogleIcon /> },
  { id: "azure", label: "Microsoft", icon: <MicrosoftIcon /> },
  { id: "apple", label: "Apple", icon: <AppleIcon /> },
];

const inputClass =
  "w-full rounded-xl bg-paper px-3 py-2.5 text-sm outline-none ring-1 ring-ink/5 transition focus:ring-2 focus:ring-mint";

export function AuthForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(
    initialError ? { kind: "error", text: initialError } : null,
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const supabase = createClient();
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          router.replace("/");
          router.refresh();
        } else {
          setNotice({
            kind: "info",
            text: "Check your inbox and click the confirmation link, then log in.",
          });
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
        router.refresh();
      }
    } catch (err) {
      setNotice({
        kind: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: Provider) {
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Microsoft needs the email scope to return the address.
        ...(provider === "azure" ? { scopes: "email" } : {}),
      },
    });
    if (error) setNotice({ kind: "error", text: error.message });
  }

  return (
    <form
      onSubmit={submit}
      className="anim-bouncein bg-cream shadow-pop ring-ink/5 rounded-3xl p-6 ring-1"
    >
      <div className="bg-ink/5 mb-5 flex gap-1 rounded-xl p-1 text-sm font-semibold">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setNotice(null);
            }}
            className={`press flex-1 rounded-lg py-2 text-center transition-colors ${
              mode === m ? "bg-cream ring-ink/5 ring-1" : "text-ink/50 hover:text-ink"
            }`}
          >
            {m === "signup" ? "Sign up" : "Log in"}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => void oauth(p.id)}
            className="press lift bg-paper ring-ink/5 flex w-full items-center justify-center gap-3 rounded-xl py-2.5 text-sm font-medium ring-1"
          >
            {p.icon}
            Continue with {p.label}
          </button>
        ))}
      </div>

      <div className="text-ink/40 my-4 flex items-center gap-3 text-xs">
        <span className="bg-ink/10 h-px flex-1" />
        or use your email
        <span className="bg-ink/10 h-px flex-1" />
      </div>

      <label htmlFor="email" className="text-ink/50 block text-xs font-semibold uppercase tracking-wide">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className={`${inputClass} mb-4 mt-1`}
      />
      <label htmlFor="password" className="text-ink/50 block text-xs font-semibold uppercase tracking-wide">
        Password
      </label>
      <input
        id="password"
        type="password"
        required
        minLength={6}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        className={`${inputClass} mb-5 mt-1`}
      />

      {notice && (
        <p
          role={notice.kind === "error" ? "alert" : "status"}
          className={`mb-4 rounded-xl px-3 py-2 text-sm font-medium ${
            notice.kind === "error" ? "bg-coral/15 text-coral" : "bg-mint/25 text-ink"
          }`}
        >
          {notice.text}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="press lift bg-mint text-ink ring-ink/5 w-full rounded-xl py-3 text-sm font-semibold ring-1 disabled:opacity-60"
      >
        {busy ? "One sec…" : mode === "signup" ? "Create free account" : "Log in"}
      </button>
    </form>
  );
}
