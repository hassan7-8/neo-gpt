"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AppleIcon,
  DiscordIcon,
  FacebookIcon,
  GithubIcon,
  GoogleIcon,
  MicrosoftIcon,
} from "./provider-icons";

type Provider = "google" | "azure" | "apple" | "github" | "discord" | "facebook";
type Mode = "signup" | "login" | "reset";
type Notice = { kind: "error" | "info"; text: string } | null;

const PROVIDERS: { id: Provider; label: string; icon: React.ReactNode }[] = [
  { id: "google", label: "Google", icon: <GoogleIcon /> },
  { id: "azure", label: "Microsoft", icon: <MicrosoftIcon /> },
  { id: "apple", label: "Apple", icon: <AppleIcon /> },
];

const MORE_PROVIDERS: { id: Provider; label: string; icon: React.ReactNode }[] = [
  { id: "github", label: "GitHub", icon: <GithubIcon /> },
  { id: "discord", label: "Discord", icon: <DiscordIcon /> },
  { id: "facebook", label: "Facebook", icon: <FacebookIcon /> },
];

const inputClass =
  "w-full rounded-xl bg-paper px-3 py-2.5 text-sm outline-none ring-1 ring-ink/5 transition focus:ring-2 focus:ring-mint";

export function AuthForm({
  initialError,
  initialMode = "signup",
}: {
  initialError?: string;
  initialMode?: "signup" | "login";
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
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
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
        });
        if (error) throw error;
        setNotice({
          kind: "info",
          text: "If that email has an account, a reset link is on its way. Check your inbox.",
        });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          router.replace("/chat");
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
        router.replace("/chat");
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
      {mode === "reset" ? (
        <div className="mb-5">
          <p className="font-display text-xl font-semibold">Reset your password</p>
          <p className="text-ink/60 mt-1 text-sm">
            Enter your email and we&apos;ll send you a link to choose a new password.
          </p>
        </div>
      ) : (
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
      )}

      {mode !== "reset" && (
      <>
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

      <div className="mt-2 grid grid-cols-3 gap-2">
        {MORE_PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => void oauth(p.id)}
            aria-label={`Continue with ${p.label}`}
            className="press lift bg-paper ring-ink/5 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium ring-1"
          >
            {p.icon}
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        ))}
      </div>

      <div className="text-ink/40 my-4 flex items-center gap-3 text-xs">
        <span className="bg-ink/10 h-px flex-1" />
        or use your email
        <span className="bg-ink/10 h-px flex-1" />
      </div>
      </>
      )}

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
      {mode !== "reset" && (
      <>
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
        className={`${inputClass} mt-1`}
      />
      {mode === "login" && (
        <button
          type="button"
          onClick={() => {
            setMode("reset");
            setNotice(null);
          }}
          className="text-ink/60 hover:text-ink mt-2 text-xs font-semibold underline underline-offset-4"
        >
          Forgot password?
        </button>
      )}
      </>
      )}
      <div className="mb-5" />

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
        {busy
          ? "One sec…"
          : mode === "signup"
            ? "Create free account"
            : mode === "login"
              ? "Log in"
              : "Send reset link"}
      </button>
      {mode === "reset" && (
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setNotice(null);
          }}
          className="text-ink/60 hover:text-ink mt-4 block w-full text-center text-sm font-semibold"
        >
          ← Back to log in
        </button>
      )}
    </form>
  );
}
