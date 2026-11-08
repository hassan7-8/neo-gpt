export const maxDuration = 60;

const IMAGE_BASE = "https://gen.pollinations.ai/image";
const IMAGE_MODEL = "flux";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const prompt = (searchParams.get("prompt") ?? "").trim().slice(0, 500);
  const seed = Number.parseInt(searchParams.get("seed") ?? "", 10);

  if (!prompt) {
    return new Response("Missing prompt", { status: 400 });
  }
  if (!process.env.POLLINATIONS_API_KEY) {
    return new Response("POLLINATIONS_API_KEY is not set", { status: 500 });
  }

  const url = new URL(`${IMAGE_BASE}/${encodeURIComponent(prompt)}`);
  url.searchParams.set("model", IMAGE_MODEL);
  url.searchParams.set("width", "1024");
  url.searchParams.set("height", "1024");
  url.searchParams.set("seed", String(Number.isFinite(seed) ? seed : -1));

  try {
    const upstream = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}` },
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      return new Response(
        `Image generation failed (${upstream.status}). ${detail.slice(0, 300)}`,
        { status: 502 },
      );
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Could not reach the image service", { status: 502 });
  }
}
