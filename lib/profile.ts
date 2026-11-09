import type { User } from "@supabase/supabase-js";

export const AVATAR_COLORS = [
  { id: "gold", label: "Gold", css: "linear-gradient(135deg, oklch(0.9 0.1 92), oklch(0.72 0.13 80))", text: "#1a1409" },
  { id: "onyx", label: "Onyx", css: "linear-gradient(135deg, #2b2620, #0f0d0a)", text: "#e8c872" },
  { id: "bronze", label: "Bronze", css: "linear-gradient(135deg, #b9794a, #7a4a2a)", text: "#fff7ec" },
  { id: "sage", label: "Sage", css: "linear-gradient(135deg, #a9b79a, #6d7f5e)", text: "#10160b" },
  { id: "rose", label: "Rose", css: "linear-gradient(135deg, #e3b5ad, #b9776c)", text: "#2a100c" },
  { id: "navy", label: "Navy", css: "linear-gradient(135deg, #3a4a6b, #1c2740)", text: "#f1e6c8" },
] as const;

export type Profile = {
  name: string;
  bio: string;
  color: string;
  email: string;
  avatarUrl: string;
  headline: string;
  location: string;
  website: string;
  aiTone: string;
  aiLanguage: string;
  aiLength: string;
  aiAbout: string;
  providers: string[];
  createdAt: string;
  lastSignIn: string;
};

export const AI_TONES = [
  { id: "", label: "Default" },
  { id: "friendly", label: "Friendly" },
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "playful", label: "Playful" },
  { id: "concise", label: "Very brief" },
] as const;

export function profileFromUser(user: User | null | undefined): Profile | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const email = user.email ?? "";
  const metaName =
    (typeof meta.display_name === "string" && meta.display_name) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  return {
    name: metaName || email.split("@")[0] || "Member",
    bio: typeof meta.bio === "string" ? meta.bio : "",
    color: typeof meta.avatar_color === "string" ? meta.avatar_color : "gold",
    email,
    avatarUrl: str(meta.avatar_url_custom),
    headline: str(meta.headline),
    location: str(meta.location),
    website: str(meta.website),
    aiTone: str(meta.ai_tone),
    aiLanguage: str(meta.ai_language),
    aiLength: str(meta.ai_length),
    aiAbout: str(meta.ai_about),
    providers: Array.isArray(user.app_metadata?.providers) ? (user.app_metadata.providers as string[]) : [],
    createdAt: user.created_at ?? "",
    lastSignIn: user.last_sign_in_at ?? "",
  };
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
}
