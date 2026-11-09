import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CONTACT_EMAIL, SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "About — Cheap Mind AI",
  description:
    "Cheap Mind AI is a fast, refined AI assistant created by MUHAMMAD.HASSAN of the Cheap Mind organization.",
};

const FACTS = [
  ["Owner & creator", "MUHAMMAD.HASSAN"],
  ["Organization", "Cheap Mind organization"],
  ["What it does", "Fast answers and picture creation with Nano Image"],
  ["Contact", CONTACT_EMAIL],
];

export default function AboutPage() {
  return (
    <div className="bg-cream text-ink min-h-screen px-5 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between py-6">
          <Logo />
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link href="/chat" className="press lift bg-mint text-ink ring-gold-deep/30 rounded-xl px-4 py-2 ring-1">
              Open chat
            </Link>
          </nav>
        </header>

        <main>
          <section className="py-14 sm:py-20">
            <p className="text-gold-deep mb-4 text-xs font-semibold uppercase tracking-[0.25em]">About us</p>
            <h1 className="font-display max-w-3xl text-balance text-5xl font-semibold leading-[1.05] sm:text-6xl">
              A quiet, quick mind <span className="text-gold-deep italic">for everyday work.</span>
            </h1>
            <p className="text-ink/70 mt-6 max-w-[58ch] text-pretty text-lg leading-8">
              Cheap Mind AI is an AI assistant built to feel effortless: ask a question, get a clear answer
              quickly, or turn an idea into a picture with Nano Image. It is created and owned by
              MUHAMMAD.HASSAN and belongs to the Cheap Mind organization.
            </p>
          </section>

          <section aria-labelledby="facts" className="pb-10">
            <h2 id="facts" className="sr-only">Key facts</h2>
            <dl className="bg-paper ring-gold-deep/20 shadow-pop-sm grid gap-px overflow-hidden rounded-3xl ring-1 sm:grid-cols-2">
              {FACTS.map(([k, v]) => (
                <div key={k} className="bg-paper p-6">
                  <dt className="text-ink/50 text-xs font-semibold uppercase tracking-wide">{k}</dt>
                  <dd className="font-display mt-2 text-xl font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="grid gap-4 py-8 sm:grid-cols-3">
            {[
              ["Our promise", "Answers that are short, clear and useful, without the noise."],
              ["Our craft", "Every screen is designed to feel calm, premium and easy to use."],
              ["Your privacy", "Login is handled securely, and your account stays yours."],
            ].map(([t, d]) => (
              <div key={t} className="ring-gold-deep/20 rounded-3xl p-6 ring-1">
                <h3 className="font-display text-xl font-semibold">{t}</h3>
                <p className="text-ink/70 mt-2 text-sm leading-6">{d}</p>
              </div>
            ))}
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
