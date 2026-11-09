import Link from "next/link";

export const CONTACT_EMAIL = "hassan7534.j@gmail.com";

export function SiteFooter({ dark = false }: { dark?: boolean }) {
  return (
    <footer
      className={`mt-16 ${dark ? "text-cream/70" : "text-ink/60"}`}
    >
      <div className="gold-hairline" />
      <div className="grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-ink text-xl font-semibold">
            Cheap Mind <span className="text-gold-deep italic">AI</span>
          </p>
          <p className="mt-2 max-w-[30ch] text-sm leading-6">
            A fast, refined AI assistant by the Cheap Mind organization.
          </p>
        </div>
        <div className="text-sm">
          <p className="text-ink mb-3 font-semibold uppercase tracking-wide text-xs">Explore</p>
          <ul className="space-y-2">
            <li><Link href="/chat" className="hover:text-ink">Chat</Link></li>
            <li><Link href="/about" className="hover:text-ink">About</Link></li>
            <li><Link href="/auth?mode=login" className="hover:text-ink">Log in</Link></li>
            <li><Link href="/auth" className="hover:text-ink">Sign up</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="text-ink mb-3 font-semibold uppercase tracking-wide text-xs">Contact</p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-deep font-semibold underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2">Owner: MUHAMMAD.HASSAN</p>
          <p>Organization: Cheap Mind</p>
        </div>
      </div>
      <p className="border-ink/5 border-t py-6 text-xs">
        © {new Date().getFullYear()} Cheap Mind organization. All rights reserved.
      </p>
    </footer>
  );
}
