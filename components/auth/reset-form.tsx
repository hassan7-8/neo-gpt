"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/chat");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="anim-bouncein bg-cream shadow-pop ring-ink/5 rounded-3xl p-6 ring-1">
      <p className="font-display text-2xl font-semibold">Choose a new password</p>
      <p className="text-ink/60 mt-1 mb-5 text-sm">You&apos;ll be logged in right after.</p>
      <label htmlFor="new-password" className="text-ink/50 block text-xs font-semibold uppercase tracking-wide">
        New password
      </label>
      <input
        id="new-password"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        className="bg-paper ring-ink/5 focus:ring-mint mt-1 mb-5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ring-1 transition focus:ring-2"
      />
      {error && (
        <p role="alert" className="bg-coral/15 text-coral mb-4 rounded-xl px-3 py-2 text-sm font-medium">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="press lift bg-mint text-ink ring-ink/5 w-full rounded-xl py-3 text-sm font-semibold ring-1 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
