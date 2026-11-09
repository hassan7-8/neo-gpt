"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AI_TONES, AVATAR_COLORS, type Profile } from "@/lib/profile";
import { AVATAR_BUCKET, shrinkImage } from "@/lib/upload-photo";
import { Avatar } from "./avatar";

const field =
  "w-full rounded-xl bg-paper px-3 py-2.5 text-sm outline-none ring-1 ring-ink/10 transition focus:ring-2 focus:ring-mint";
const label = "text-ink/50 block text-xs font-semibold uppercase tracking-wide";
const primary =
  "press lift bg-mint text-ink ring-gold-deep/30 w-full rounded-xl py-3 text-sm font-semibold ring-1 disabled:opacity-60";
const card = "bg-cream ring-gold-deep/20 shadow-pop rounded-3xl p-6 ring-1";

type Notice = { kind: "ok" | "error"; text: string } | null;
type Tab = "profile" | "ai" | "security" | "account";
const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "ai", label: "AI preferences" },
  { id: "security", label: "Security" },
  { id: "account", label: "Account" },
];

const PROVIDER_NAMES: Record<string, string> = { email: "Email & password", google: "Google", x: "X (Twitter)" };
const fmt = (iso: string) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

function NoticeBox({ n }: { n: Notice }): ReactNode {
  if (!n) return null;
  return (
    <p
      role={n.kind === "error" ? "alert" : "status"}
      className={`mb-4 rounded-xl px-3 py-2 text-sm font-medium ${n.kind === "error" ? "bg-coral/15 text-coral" : "bg-mint/30 text-ink"}`}
    >
      {n.text}
    </p>
  );
}

export function ProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  // profile
  const [name, setName] = useState(initial.name);
  const [headline, setHeadline] = useState(initial.headline);
  const [bio, setBio] = useState(initial.bio);
  const [location, setLocation] = useState(initial.location);
  const [website, setWebsite] = useState(initial.website);
  const [color, setColor] = useState(initial.color);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ai
  const [aiTone, setAiTone] = useState(initial.aiTone);
  const [aiLanguage, setAiLanguage] = useState(initial.aiLanguage);
  const [aiLength, setAiLength] = useState(initial.aiLength);
  const [aiAbout, setAiAbout] = useState(initial.aiAbout);

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [password, setPassword] = useState("");

  const supabase = () => createClient();

  async function save(data: Record<string, unknown>, ok: string) {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const { error } = await supabase().auth.updateUser({ data });
    setBusy(false);
    if (error) return setNotice({ kind: "error", text: error.message });
    setNotice({ kind: "ok", text: ok });
    router.refresh();
  }

  function saveProfile(e: FormEvent) {
    e.preventDefault();
    let site = website.trim();
    if (site && !/^https?:\/\//i.test(site)) site = `https://${site}`;
    void save(
      {
        display_name: name.trim(), full_name: name.trim(), headline: headline.trim(), bio: bio.trim(),
        location: location.trim(), website: site, avatar_color: color, avatar_url_custom: avatarUrl,
      },
      "Profile saved.",
    );
  }

  function saveAi(e: FormEvent) {
    e.preventDefault();
    void save(
      { ai_tone: aiTone, ai_language: aiLanguage.trim(), ai_length: aiLength, ai_about: aiAbout.trim() },
      "Saved. Cheap Mind AI will use this in your next chat.",
    );
  }

  async function uploadAvatar(file: File | undefined) {
    if (!file) return;
    setPhotoBusy(true);
    setNotice(null);
    try {
      const blob = await shrinkImage(file, 384, 0.88);
      const sb = supabase();
      const { data: u } = await sb.auth.getUser();
      if (!u.user) throw new Error("Please log in again.");
      const path = `${u.user.id}/avatar.jpg`;
      const { error } = await sb.storage.from(AVATAR_BUCKET).upload(path, blob, {
        contentType: "image/jpeg", upsert: true, cacheControl: "60",
      });
      if (error) {
        throw new Error(/bucket/i.test(error.message) ? "Photo storage isn't set up yet (run supabase/storage.sql)." : error.message);
      }
      const url = `${sb.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
      setAvatarUrl(url);
      setNotice({ kind: "ok", text: "Photo ready. Press “Save profile” to keep it." });
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const { error } = await supabase().auth.updateUser({ password });
    setBusy(false);
    if (error) return setNotice({ kind: "error", text: error.message });
    setPassword("");
    setNotice({ kind: "ok", text: "Password updated." });
  }

  async function signOutEverywhere() {
    await supabase().auth.signOut({ scope: "global" });
    window.location.href = "/";
  }

  function exportData() {
    const data = {
      email: initial.email, name, headline, bio, location, website,
      aiPreferences: { tone: aiTone, language: aiLanguage, length: aiLength, about: aiAbout },
      createdAt: initial.createdAt, exportedAt: new Date().toISOString(),
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    a.download = "cheap-mind-ai-profile.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const shown = name || initial.email;
  const completeness = Math.round(
    ([name, headline, bio, location, website, avatarUrl || (color !== "gold" ? "c" : ""), aiAbout || aiTone].filter(Boolean).length / 7) * 100,
  );

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className={card}>
        <div className="flex items-center gap-4">
          <Avatar name={shown} color={color} url={avatarUrl} size={76} />
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-2xl font-semibold">{name || "Your name"}</p>
            {headline && <p className="text-ink/70 truncate text-sm">{headline}</p>}
            <p className="text-ink/50 truncate text-xs">{initial.email}</p>
          </div>
        </div>
        <div className="mt-5">
          <div className="text-ink/55 mb-1 flex justify-between text-xs font-semibold">
            <span>Profile strength</span>
            <span>{completeness}%</span>
          </div>
          <div className="bg-ink/10 h-1.5 overflow-hidden rounded-full">
            <div className="bg-mint h-full rounded-full transition-all" style={{ width: `${completeness}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" className="bg-paper ring-ink/10 flex gap-1 overflow-x-auto rounded-2xl p-1 ring-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => { setTab(t.id); setNotice(null); }}
            className={`press flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition ${tab === t.id ? "bg-mint text-ink" : "text-ink/60 hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form onSubmit={saveProfile} className={card}>
          <p className={label}>Profile photo</p>
          <div className="mb-5 mt-2 flex flex-wrap items-center gap-3">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => uploadAvatar(e.target.files?.[0])} />
            <button type="button" disabled={photoBusy} onClick={() => fileRef.current?.click()} className="press bg-paper ring-ink/10 rounded-xl px-4 py-2 text-sm font-semibold ring-1 disabled:opacity-60">
              {photoBusy ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {avatarUrl && (
              <button type="button" onClick={() => setAvatarUrl("")} className="text-ink/60 text-sm underline">Remove photo</button>
            )}
          </div>

          <p className={label}>Avatar color {avatarUrl && <span className="text-ink/35 normal-case">(used when no photo)</span>}</p>
          <div className="mb-5 mt-2 flex flex-wrap gap-3">
            {AVATAR_COLORS.map((c) => (
              <button key={c.id} type="button" onClick={() => setColor(c.id)} aria-label={c.label} aria-pressed={color === c.id}
                className={`press size-9 rounded-full ring-offset-2 transition ${color === c.id ? "ring-gold-deep ring-2" : "ring-ink/10 ring-1"}`}
                style={{ background: c.css }} />
            ))}
          </div>

          <label htmlFor="name" className={label}>Display name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required className={`${field} mb-4 mt-1`} />

          <label htmlFor="headline" className={label}>Headline</label>
          <input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={80} placeholder="e.g. Student · Designer · Curious mind" className={`${field} mb-4 mt-1`} />

          <label htmlFor="bio" className={label}>About you</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={240} rows={3} placeholder="A few lines about you (optional)" className={`${field} mb-1 mt-1 resize-none`} />
          <p className="text-ink/40 mb-4 text-right text-xs">{bio.length}/240</p>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="loc" className={label}>Location</label>
              <input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={60} placeholder="City, Country" className={`${field} mt-1`} />
            </div>
            <div>
              <label htmlFor="web" className={label}>Website</label>
              <input id="web" value={website} onChange={(e) => setWebsite(e.target.value)} maxLength={120} placeholder="yoursite.com" className={`${field} mt-1`} />
            </div>
          </div>

          <NoticeBox n={notice} />
          <button type="submit" disabled={busy} className={primary}>{busy ? "Saving…" : "Save profile"}</button>
        </form>
      )}

      {tab === "ai" && (
        <form onSubmit={saveAi} className={card}>
          <p className="font-display text-xl font-semibold">Make the AI yours</p>
          <p className="text-ink/55 mb-5 mt-1 text-sm">Cheap Mind AI follows these in every chat while you are logged in.</p>

          <p className={label}>Tone</p>
          <div className="mb-5 mt-2 flex flex-wrap gap-2">
            {AI_TONES.map((t) => (
              <button key={t.id} type="button" aria-pressed={aiTone === t.id} onClick={() => setAiTone(t.id)}
                className={`press rounded-xl px-3 py-1.5 text-sm font-semibold ring-1 ${aiTone === t.id ? "bg-mint text-ink ring-gold-deep/40" : "bg-paper text-ink/70 ring-ink/10"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <p className={label}>Answer length</p>
          <div className="mb-5 mt-2 flex gap-2">
            {[["", "Balanced"], ["short", "Short"], ["detailed", "Detailed"]].map(([id, text]) => (
              <button key={id} type="button" aria-pressed={aiLength === id} onClick={() => setAiLength(id)}
                className={`press rounded-xl px-3 py-1.5 text-sm font-semibold ring-1 ${aiLength === id ? "bg-mint text-ink ring-gold-deep/40" : "bg-paper text-ink/70 ring-ink/10"}`}>
                {text}
              </button>
            ))}
          </div>

          <label htmlFor="lang" className={label}>Always reply in</label>
          <input id="lang" value={aiLanguage} onChange={(e) => setAiLanguage(e.target.value)} maxLength={30} placeholder="e.g. English, Urdu, Spanish (leave empty = same as you)" className={`${field} mb-5 mt-1`} />

          <label htmlFor="about" className={label}>What should the AI know about you?</label>
          <textarea id="about" value={aiAbout} onChange={(e) => setAiAbout(e.target.value)} maxLength={400} rows={4} placeholder="e.g. I'm a 2nd-year student learning web development. Explain with simple examples." className={`${field} mb-1 mt-1 resize-none`} />
          <p className="text-ink/40 mb-5 text-right text-xs">{aiAbout.length}/400</p>

          <NoticeBox n={notice} />
          <button type="submit" disabled={busy} className={primary}>{busy ? "Saving…" : "Save AI preferences"}</button>
        </form>
      )}

      {tab === "security" && (
        <div className="space-y-5">
          <form onSubmit={changePassword} className="bg-paper ring-ink/10 rounded-3xl p-6 ring-1">
            <p className="font-display text-xl font-semibold">Change password</p>
            <p className="text-ink/55 mb-4 mt-1 text-sm">If you log in with Google or X you can still add a password here.</p>
            <label htmlFor="pw" className={label}>New password</label>
            <input id="pw" type="password" minLength={6} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${field} mb-4 mt-1`} />
            <NoticeBox n={notice} />
            <button type="submit" disabled={busy} className="press bg-ink text-cream w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-60">{busy ? "Updating…" : "Update password"}</button>
          </form>

          <div className="bg-paper ring-ink/10 rounded-3xl p-6 ring-1">
            <p className="font-display text-xl font-semibold">Sessions</p>
            <p className="text-ink/55 mb-4 mt-1 text-sm">Last sign-in: {fmt(initial.lastSignIn)}. Lost a phone or used a shared computer? Log out on every device.</p>
            <button type="button" onClick={signOutEverywhere} className="press ring-ink/15 w-full rounded-xl py-3 text-sm font-semibold ring-1">Log out everywhere</button>
          </div>
        </div>
      )}

      {tab === "account" && (
        <div className="bg-paper ring-ink/10 space-y-5 rounded-3xl p-6 ring-1">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-ink/55">Email</dt><dd className="truncate font-medium">{initial.email}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink/55">Member since</dt><dd className="font-medium">{fmt(initial.createdAt)}</dd></div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/55">Login methods</dt>
              <dd className="font-medium">{initial.providers.map((p) => PROVIDER_NAMES[p] ?? p).join(", ") || "—"}</dd>
            </div>
          </dl>
          <button type="button" onClick={exportData} className="press bg-mint text-ink ring-gold-deep/30 w-full rounded-xl py-3 text-sm font-semibold ring-1">Download my profile data (.json)</button>
          <p className="text-ink/50 text-xs">To delete your account, email the site owner from the contact address in the footer and it will be removed.</p>
        </div>
      )}
    </div>
  );
}
