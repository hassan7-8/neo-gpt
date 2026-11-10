import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { authConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Shared = { title: string; messages: { role: "user" | "assistant"; text: string }[]; updated_at: string };

async function load(id: string): Promise<Shared | null> {
  if (!authConfigured || !/^[a-z0-9]{6,32}$/.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_shared_chat", { p_share_id: id });
  const row = Array.isArray(data) ? data[0] : null;
  return row ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const chat = await load((await params).id);
  return {
    title: chat ? `${chat.title} — Cheap Mind AI` : "Shared chat — Cheap Mind AI",
    robots: { index: false },
  };
}

// Generated pictures need a login, so a shared page shows a short note instead.
const clean = (t: string) => t.replace(/!\[([^\]]*)\]\([^)]*\)/g, "[Picture: $1]");

export default async function SharedChatPage({ params }: { params: Promise<{ id: string }> }) {
  const chat = await load((await params).id);
  if (!chat) notFound();

  return (
    <div className="bg-cream text-ink min-h-screen px-5 py-6 sm:px-8">
      <header className="mx-auto flex max-w-2xl items-center justify-between">
        <Logo />
        <Link href="/chat" className="press lift bg-mint text-ink ring-gold-deep/30 rounded-xl px-4 py-2 text-sm font-semibold ring-1">
          Try it free
        </Link>
      </header>

      <main className="mx-auto mt-10 max-w-2xl">
        <p className="text-ink/50 text-xs font-semibold uppercase tracking-wide">Shared chat</p>
        <h1 className="font-display mb-8 mt-1 text-3xl font-semibold" dir="auto">{chat.title}</h1>

        <div className="space-y-4">
          {chat.messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <p
                dir="auto"
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-3xl px-5 py-3 text-sm leading-7 ring-1 ring-ink/5 ${
                  m.role === "user" ? "bg-sky/25 rounded-br-lg" : "bg-paper rounded-bl-lg"
                }`}
              >
                {clean(m.text)}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-paper ring-gold-deep/20 mt-12 rounded-3xl p-6 text-center ring-1">
          <p className="font-display text-xl font-semibold">Made with Cheap Mind AI</p>
          <p className="text-ink/60 mx-auto mt-1 max-w-[40ch] text-sm">
            A fast, refined AI assistant for answers, images and photo edits. Free to start.
          </p>
          <Link href="/chat" className="press lift bg-mint text-ink ring-gold-deep/30 mt-4 inline-block rounded-xl px-6 py-2.5 text-sm font-semibold ring-1">
            Start chatting
          </Link>
        </div>
      </main>
    </div>
  );
}
