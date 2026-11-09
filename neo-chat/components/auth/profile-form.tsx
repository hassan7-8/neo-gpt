"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_COLORS, type Profile } from "@/lib/profile";
import { Avatar } from "./avatar";

const field =
  "w-full rounded-xl bg-paper px-3 py-2.5 text-sm outline-none ring-1 ring-ink/10 transition focus:ring-2 focus:ring-mint";
const label = "text-ink/50 block text-xs font-semibold uppercase tracking-wide";

type Notice = { kind: "ok" | "error"; text: string } | null;

export function ProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio);
  const [color, setColor] = useState(initial.color);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const [password, setPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwNotice, setPwNotice] = useState<Notice>(null);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setNotice(null);
    const { error } = await createClient().auth.updateUser({
      data: { display_name: name.trim(), full_name: name.trim(), bio: bio.trim(), avatar_color: color },
    });
    setSaving(false);
    if (error) return setNotice({ kind: "error", text: error.message });
    setNotice({ kind: "ok", text: "Profile saved." });
    router.refresh();
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (pwBusy) return;
    setPwBusy(true);
    setPwNotice(null);
    const { error } = await createClient().auth.updateUser({ password });
    setPwBusy(false);
    if (error) return setPwNotice({ kind: "error", text: error.message });
    setPassword("");
    setPwNotice({ kind: "ok", text: "Password updated." });
  }

  const noticeEl = (n: Notice) =>
    n && (
      <p
        role={n.kind === "error" ? "alert" : "status"}
        className={`mb-4 rounded-xl px-3 py-2 text-sm font-medium ${
          n.kind === "error" ? "bg-coral/15 text-coral" : "bg-mint/30 text-ink"
        }`}
      >
        {n.text}
      </p>
    );

  return (
    <div className="space-y-6">
      <form onSubmit={saveProfile} className="bg-cream ring-gold-deep/20 shadow-pop rounded-3xl p-6 ring-1">
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={name || initial.email} color={color} size={72} />
          <div className="min-w-0">
            <p className="font-display truncate text-2xl font-semibold">{name || "Your name"}</p>
            <p className="text-ink/55 truncate text-sm">{initial.email}</p>
          </div>
        </div>

        <label htmlFor="name" className={label}>Display name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required className={`${field} mb-4 mt-1`} />

        <label htmlFor="bio" className={label}>About you</label>
        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={3} placeholder="A line about you (optional)" className={`${field} mb-1 mt-1 resize-none`} />
        <p className="text-ink/40 mb-4 text-right text-xs">{bio.length}/160</p>

        <p className={label}>Avatar color</p>
        <div className="mb-6 mt-2 flex flex-wrap gap-3">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColor(c.id)}
              aria-label={c.label}
              aria-pressed={color === c.id}
              className={`press size-9 rounded-full ring-offset-2 transition ${color === c.id ? "ring-gold-deep ring-2" : "ring-ink/10 ring-1"}`}
              style={{ background: c.css }}
            />
          ))}
        </div>

        {noticeEl(notice)}
        <button type="submit" disabled={saving} className="press lift bg-mint text-ink ring-gold-deep/30 w-full rounded-xl py-3 text-sm font-semibold ring-1 disabled:opacity-60">
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form onSubmit={changePassword} className="bg-paper ring-ink/10 rounded-3xl p-6 ring-1">
        <p className="font-display text-xl font-semibold">Change password</p>
        <p className="text-ink/55 mb-4 mt-1 text-sm">If you log in with Google or Facebook you can still add a password here.</p>
        <label htmlFor="pw" className={label}>New password</label>
        <input id="pw" type="password" minLength={6} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${field} mb-4 mt-1`} />
        {noticeEl(pwNotice)}
        <button type="submit" disabled={pwBusy} className="press bg-ink text-cream w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-60">
          {pwBusy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
