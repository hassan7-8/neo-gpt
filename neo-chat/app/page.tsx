import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getUser } from "@/lib/supabase/get-user";

const FEATURES = [
  { dot: "bg-mint", title: "Fast answers", text: "Ask anything and get a clear reply in seconds: writing, ideas, homework, plans and code." },
  { dot: "bg-coral", title: "Draw with words", text: "Type /image and a description, and Cheap Mind AI paints the picture for you." },
  { dot: "bg-sky", title: "Free to start", text: "Try the chat as a guest, or make a free account to unlock images and keep going." },
];

const STEPS = [
  ["1", "Pick how to start", "Sign up with email, Google, Microsoft, Apple, GitHub, Discord or Facebook, or just try it as a guest."],
  ["2", "Say what you need", "Write your question or idea in plain words, like you would to a friend."],
  ["3", "Get your answer", "Read the reply, ask a follow-up, or turn your idea into a picture with /image."],
];

const FAQ = [
  ["Is it really free?", "Yes. You can chat as a guest with a small free allowance, and a free account gives you more, plus image generation."],
  ["Do I need to log in?", "No. Guests can try the chat right away. Logging in unlocks images and removes the guest limit."],
  ["Is my account safe?", "Login is handled by Supabase. Passwords are never stored in our code, and you can also sign in with Google, Microsoft or Apple instead of a password."],
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const { configured, user } = await getUser();
  if (configured && user) redirect("/chat");

  return (
    <div className="bg-cream text-ink relative min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="anim-orb bg-mint/25 absolute -left-20 top-20 size-72 rounded-full blur-3xl" />
        <div className="anim-drift bg-sky/25 absolute -right-16 top-1/4 size-80 rounded-full blur-3xl" />
        <div className="anim-orb bg-plum/15 absolute bottom-20 left-1/3 size-64 rounded-full blur-3xl" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <header className="flex items-center justify-between py-6">
          <Logo />
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link href="/auth?mode=login" className="press bg-paper ring-ink/5 rounded-xl px-4 py-2 ring-1">
              Log in
            </Link>
            <Link href="/auth" className="press lift bg-mint text-ink ring-ink/5 rounded-xl px-4 py-2 ring-1">
              Sign up
            </Link>
          </nav>
        </header>

        <main>
          <section className="py-14 text-center sm:py-20">
            <div className="anim-slideup bg-coral/10 text-coral ring-coral/25 mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1">
              <span className="bg-coral size-2 rounded-full" />
              A fast brain that costs pennies
            </div>
            <h1 className="anim-slideup font-display mx-auto max-w-3xl text-balance text-5xl font-semibold leading-none sm:text-6xl" style={{ animationDelay: "80ms" }}>
              Chat smarter.
              <br />
              Draw with words.
            </h1>
            <p className="anim-slideup text-ink/70 mx-auto mt-6 max-w-[48ch] text-pretty text-lg" style={{ animationDelay: "160ms" }}>
              Cheap Mind AI answers your questions and turns your ideas into pictures, in one clean screen.
            </p>
            <div className="anim-slideup mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "240ms" }}>
              <Link href="/auth" className="press lift bg-mint text-ink ring-ink/5 shadow-pop-sm rounded-2xl px-6 py-3.5 text-base font-semibold ring-1">
                Create free account
              </Link>
              <Link href="/chat" className="press lift bg-paper ring-ink/5 rounded-2xl px-6 py-3.5 text-base font-semibold ring-1">
                Try as guest →
              </Link>
            </div>
          </section>

          <section aria-labelledby="features" className="py-8">
            <h2 id="features" className="font-display text-center text-3xl font-semibold">What you can do</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="anim-slideup bg-paper shadow-pop-sm ring-ink/5 rounded-3xl p-6 ring-1" style={{ animationDelay: `${80 * i}ms` }}>
                  <span className={`${f.dot} mb-4 block size-3 rounded-full`} />
                  <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                  <p className="text-ink/70 mt-2 text-sm leading-6">{f.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="how" className="py-14">
            <h2 id="how" className="font-display text-center text-3xl font-semibold">How it works</h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {STEPS.map(([n, title, text]) => (
                <li key={n} className="bg-cream ring-ink/5 rounded-3xl p-6 ring-1">
                  <span className="bg-butter font-display mb-4 flex size-9 items-center justify-center rounded-full font-semibold">{n}</span>
                  <h3 className="font-display text-lg font-semibold">{title}</h3>
                  <p className="text-ink/70 mt-2 text-sm leading-6">{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="faq" className="mx-auto max-w-2xl py-8">
            <h2 id="faq" className="font-display text-center text-3xl font-semibold">Questions</h2>
            <div className="mt-8 space-y-3">
              {FAQ.map(([q, a]) => (
                <details key={q} className="bg-paper ring-ink/5 rounded-2xl px-5 py-4 ring-1">
                  <summary className="cursor-pointer text-sm font-semibold">{q}</summary>
                  <p className="text-ink/70 mt-2 text-sm leading-6">{a}</p>
                </details>
              ))}
            </div>
          </section>
        </main>

        <footer className="text-ink/50 border-ink/5 mt-10 flex flex-wrap items-center justify-between gap-3 border-t py-8 text-sm">
          <span>© {new Date().getFullYear()} Cheap Mind AI</span>
          <span className="flex gap-4 font-medium">
            <Link href="/chat" className="hover:text-ink">Chat</Link>
            <Link href="/auth?mode=login" className="hover:text-ink">Log in</Link>
            <Link href="/auth" className="hover:text-ink">Sign up</Link>
          </span>
        </footer>
      </div>
    </div>
  );
}
