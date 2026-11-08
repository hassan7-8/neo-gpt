// Best-effort limit for visitors who are not logged in. State lives in server
// memory, so it resets when the server restarts and is per server instance.
const WINDOW_MS = 60 * 60 * 1000;
export const GUEST_MESSAGE_LIMIT = 8;

const hits = new Map<string, number[]>();

export function guestKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip") || "unknown";
}

/** Returns true when this guest has used up their free messages. */
export function guestLimited(req: Request): boolean {
  const key = guestKey(req);
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= GUEST_MESSAGE_LIMIT) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}
