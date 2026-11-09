import { AVATAR_COLORS, initials } from "@/lib/profile";

export function Avatar({
  name,
  color = "gold",
  size = 36,
  url,
}: {
  name: string;
  color?: string;
  size?: number;
  url?: string;
}) {
  const c = AVATAR_COLORS.find((x) => x.id === color) ?? AVATAR_COLORS[0];
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover ring-2 ring-white/70"
        style={{ width: size, height: size, boxShadow: "0 4px 14px -6px rgba(0,0,0,0.45)" }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="font-display inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-white/70"
      style={{
        width: size,
        height: size,
        background: c.css,
        color: c.text,
        fontSize: Math.round(size * 0.4),
        boxShadow: "0 4px 14px -6px rgba(0,0,0,0.45)",
      }}
    >
      {initials(name)}
    </span>
  );
}
