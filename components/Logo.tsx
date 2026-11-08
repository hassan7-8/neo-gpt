import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <Link
      href="/"
      className={`font-display text-ink inline-flex items-center gap-2 font-semibold ${size === "sm" ? "text-base" : "text-lg"}`}
    >
      <span className="bg-coral size-3 rounded-full" />
      Cheap Mind <span className="text-mint">AI</span>
    </Link>
  );
}
