"use client";

import { useEffect, useState } from "react";
import { DownloadIcon, ImageIcon, RefreshCwIcon } from "lucide-react";
import { deleteEditPhotos } from "@/lib/upload-photo";
import { stampImage } from "@/lib/watermark";

const STATUS_STEPS = [
  { after: 0, text: "Creating your image…" },
  { after: 6, text: "Painting the details…" },
  { after: 15, text: "Adding the finishing touches…" },
  { after: 30, text: "Still working. Please keep this page open, large images can take up to a minute." },
];

/** Image that clearly tells the user it is being generated while it loads. */
export function GeneratedImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [seconds, setSeconds] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "loading") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status, attempt]);

  const isEdit = src.startsWith("/api/edit");

  // Uploaded source photos are temporary: remove them once the result has loaded.
  useEffect(() => {
    if (status !== "done" || !isEdit) return;
    const paths = new URLSearchParams(src.split("?")[1] ?? "").get("src");
    if (paths) void deleteEditPhotos(paths.split(",").filter(Boolean));
  }, [status, isEdit, src]);

  const url = attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}`;
  const message = [...STATUS_STEPS].reverse().find((s) => seconds >= s.after)?.text ?? STATUS_STEPS[0].text;

  return (
    <span className="my-3 block w-full max-w-sm">
      <span className={`bg-muted ring-ink/10 relative block w-full overflow-hidden rounded-2xl ring-1 ${isEdit && status === "done" ? "" : "aspect-square"}`}>
        {/* Loader: keeps downloading in the background, never shown. The stamped copy is shown instead. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={url}
          src={url}
          alt=""
          aria-hidden
          onLoad={async (e) => {
            const img = e.currentTarget;
            try {
              setShown(await stampImage(img));
            } catch {
              setShown(img.src);
            }
            setStatus("done");
          }}
          onError={() => setStatus("error")}
          className="pointer-events-none absolute inset-0 size-full opacity-0"
        />
        {shown && status === "done" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt={alt}
            draggable={false}
            className={`${isEdit ? "relative block h-auto w-full" : "absolute inset-0 size-full object-cover"} anim-pop`}
          />
        )}

        {status === "loading" && (
          <span
            role="status"
            aria-live="polite"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
            style={{
              backgroundImage:
                "linear-gradient(110deg, transparent 30%, oklch(0.9 0.1 92 / 0.35) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.2s linear infinite",
            }}
          >
            <span className="bg-mint text-ink anim-floaty flex size-12 items-center justify-center rounded-2xl shadow-md">
              <ImageIcon className="size-6" />
            </span>
            <span className="text-ink text-sm font-semibold">{message}</span>
            <span className="text-ink/55 text-xs tabular-nums">{seconds}s</span>
          </span>
        )}

        {status === "error" && (
          <span
            role="alert"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
          >
            <span className="text-ink text-sm font-semibold">We couldn&apos;t create that image.</span>
            <span className="text-ink/60 text-xs">
              The image service may be busy, or your daily limit may be used up. Please try again.
            </span>
            <button
              type="button"
              onClick={() => {
                setSeconds(0);
                setStatus("loading");
                setAttempt((n) => n + 1);
              }}
              className="press bg-mint text-ink inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold"
            >
              <RefreshCwIcon className="size-4" /> Try again
            </button>
          </span>
        )}
      </span>
      {status === "done" && (
        <span className="text-ink/50 mt-1.5 flex items-center justify-between gap-3 text-xs">
          <span className="truncate">{isEdit ? "Nano Edit" : "Nano Image"}{alt ? ` · ${alt}` : ""}</span>
          {shown && (
            <a href={shown} download="cheap-mind-ai.jpg" className="press ring-ink/10 hover:text-ink inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 font-semibold ring-1">
              <DownloadIcon className="size-3.5" /> Save
            </a>
          )}
        </span>
      )}
    </span>
  );
}
