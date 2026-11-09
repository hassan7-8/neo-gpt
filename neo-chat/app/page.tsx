import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { getUser } from "@/lib/supabase/get-user";

const FEATURES = [
  { n: "01", title: "Fast answers", text: "Ask anything and get a clear, concise reply in seconds: writing, ideas, study, plans and code." },
  { n: "02", title: "Nano Image", text: "Tap Nano Image, describe what you imagine, and watch it become a picture." },
  { n: "03", title: "Free to begin", text: "Try the chat as a guest, or open a free account to unlock images and your own profile." },
];

const STEPS = [
  ["I", "Choose how to begin", "Sign up with email, Google or Facebook, or simply try it as a guest."],
  ["II", "Say what you need", "Write your question or idea in plain words, the way you would to a friend."],
  ["III", "Receive your answer", "Read the reply, ask a follow-up, or tap Nano Image to turn an idea into art."],
];

const FAQ = [
  ["Is it really free?", "Yes. Guests can chat with a small free allowance, and a free account unlocks more, plus Nano Image."],
  ["Do I need to log in?", "No. You can try the chat right away. Logging in unlocks images and removes the guest limit."],
  ["Who owns Cheap Mind AI?", "Cheap Mind AI is owned and created by MUHAMMAD.HASSAN of the Cheap Mind organization."],
  ["Is my account safe?", "Login is handled by Supabase. We never store passwords in our code, and you can sign in with Google or Facebook instead of a password."],
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const { configured, user } = await getUser();
  if (configured && user) redirect("/chat");

  return (
    <div className="bg-cream text-ink min-h-screen">
      {/* Dark, luxurious hero */}
      <div className="bg-ink text-cream relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="anim-orb bg-mint/20 absolute -left-24 -top-24 size-96 rounded-full blur-3xl" />
          <div className="anim-drift absolute -right-20 bottom-0 size-80 rounded-full bg-[oklch(0.7_0.12_75/0.18)] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          <header className="flex items-center justify-between py-6">
            <Logo dark />
            <nav className="flex items-center gap-2 text-sm font-semibold">
              <Link href="/about" className="text-cream/70 hover:text-cream hidden px-3 py-2 sm:inline">About</Link>
              <Link href="/auth?mode=login" className="press ring-cream/25 text-cream rounded-xl px-4 py-2 ring-1 hover:bg-white/5">
                Log in
              </Link>
              <Link href="/auth" className="press lift bg-mint text-ink rounded-xl px-4 py-2">
                Sign up
              </Link>
            </nav>
          </header>

          <section className="py-16 text-center sm:py-24">
            <p className="anim-slideup text-mint mb-6 text-xs font-semibold uppercase tracking-[0.3em]">
              By Cheap Mind organization
            </p>
            <h1 className="anim-slideup font-display mx-auto max-w-3xl text-balance text-5xl font-semibold leading-[1.05] sm:text-7xl" style={{ animationDelay: "80ms" }}>
              Intelligence, <span className="gold-text italic">refined.</span>
            </h1>
            <p className="anim-slideup text-cream/70 mx-auto mt-6 max-w-[46ch] text-pretty text-lg leading-8" style={{ animationDelay: "160ms" }}>
              Chat with a fast, elegant AI and turn your ideas into pictures with Nano Image, all in one calm screen.
            </p>
            <div className="anim-slideup mt-10 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "240ms" }}>
              <Link href="/auth" className="press lift bg-mint text-ink rounded-2xl px-7 py-3.5 text-base font-semibold">
                Create free account
              </Link>
              <Link href="/chat" className="press ring-cream/25 text-cream rounded-2xl px-7 py-3.5 text-base font-semibold ring-1 hover:bg-white/5">
                Try as guest →
              </Link>
            </div>
          </section>
        </div>
        <div className="gold-hairline" />
      </div>

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <main>
          <section aria-labelledby="features" className="py-16">
            <p className="text-gold-deep mb-3 text-center text-xs font-semibold uppercase tracking-[0.25em]">Features</p>
            <h2 id="features" className="font-display text-center text-4xl font-semibold">What you can do</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="anim-slideup bg-paper ring-gold-deep/20 shadow-pop-sm rounded-3xl p-7 ring-1" style={{ animationDelay: `${80 * i}ms` }}>
                  <span className="font-display text-gold-deep text-sm font-semibold tracking-widest">{f.n}</span>
                  <h3 className="font-display mt-3 text-2xl font-semibold">{f.title}</h3>
                  <p className="text-ink/70 mt-2 text-sm leading-6">{f.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="how" className="py-10">
            <p className="text-gold-deep mb-3 text-center text-xs font-semibold uppercase tracking-[0.25em]">Process</p>
            <h2 id="how" className="font-display text-center text-4xl font-semibold">How it works</h2>
            <ol className="mt-10 grid gap-5 sm:grid-cols-3">
              {STEPS.map(([n, title, text]) => (
                <li key={n} className="ring-gold-deep/20 rounded-3xl p-7 ring-1">
                  <span className="font-display gold-text text-4xl font-semibold italic">{n}</span>
                  <h3 className="font-display mt-3 text-xl font-semibold">{title}</h3>
                  <p className="text-ink/70 mt-2 text-sm leading-6">{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="faq" className="mx-auto max-w-2xl py-14">
            <h2 id="faq" className="font-display text-center text-4xl font-semibold">Questions</h2>
            <div className="mt-8 space-y-3">
              {FAQ.map(([q, a]) => (
                <details key={q} className="bg-paper ring-gold-deep/20 rounded-2xl px-5 py-4 ring-1">
                  <summary className="cursor-pointer text-sm font-semibold">{q}</summary>
                  <p className="text-ink/70 mt-2 text-sm leading-6">{a}</p>
                </details>
              ))}
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
