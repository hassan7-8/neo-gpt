import Link from "next/link";

export function Logo({ size = "md", dark = false }: { size?: "sm" | "md"; dark?: boolean }) {
  return (
    <Link
      href="/"
      className={`font-display inline-flex items-center gap-2.5 font-semibold tracking-tight ${
        size === "sm" ? "text-base" : "text-xl"
      } ${dark ? "text-cream" : "text-ink"}`}
    >
      <span className="bg-mint size-2.5 rotate-45 rounded-[2px]" />
      <span>
        Cheap Mind{" "}
        <span className={`italic ${dark ? "gold-text" : "text-gold-deep"}`}>AI</span>
      </span>
    </Link>
  );
}
