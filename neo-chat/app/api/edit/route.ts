import { requireUser } from "@/lib/supabase/get-user";
import { SUPABASE_URL } from "@/lib/supabase/config";

export const maxDuration = 60;

const IMAGE_BASE = "https://gen.pollinations.ai/image";
// Model names can be changed in Vercel without touching the code.
const MODEL_ONE = process.env.POLLINATIONS_EDIT_MODEL ?? "kontext";
const MODEL_MANY = process.env.POLLINATIONS_EDIT_MODEL_MULTI ?? "nanobanana";

/** Only photos from our own Supabase "photo-edits" bucket may be sent to the editor. */
function isOurPhoto(url: string) {
  return Boolean(
    SUPABASE_URL && url.startsWith(`${SUPABASE_URL}/storage/v1/object/public/photo-edits/`),
  );
}

export async function GET(req: Request) {
  const denied = await requireUser();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const prompt = (searchParams.get("prompt") ?? "").trim().slice(0, 500);
  const images = (searchParams.get("image") ?? "").split(",").map((u) => u.trim()).filter(Boolean).slice(0, 2);
  const seed = Number.parseInt(searchParams.get("seed") ?? "", 10);

  if (!prompt) return new Response("Missing instructions", { status: 400 });
  if (images.length === 0 || !images.every(isOurPhoto)) {
    return new Response("Missing or invalid photo", { status: 400 });
  }
  if (!process.env.POLLINATIONS_API_KEY) {
    return new Response("POLLINATIONS_API_KEY is not set", { status: 500 });
  }

  const url = new URL(`${IMAGE_BASE}/${encodeURIComponent(prompt)}`);
  url.searchParams.set("model", images.length > 1 ? MODEL_MANY : MODEL_ONE);
  url.searchParams.set("image", images.join(","));
  url.searchParams.set("seed", String(Number.isFinite(seed) ? seed : -1));

  try {
    const upstream = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}` },
    });
    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      return new Response(`Photo edit failed (${upstream.status}). ${detail.slice(0, 300)}`, { status: 502 });
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Could not reach the image service", { status: 502 });
  }
}
