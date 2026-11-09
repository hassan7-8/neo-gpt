"use client";

import { useRef, useState, type FC } from "react";
import { ImagePlusIcon, Loader2Icon, XIcon } from "lucide-react";
import { MAX_EDIT_PHOTOS, useNanoImage } from "@/lib/nano-image";
import { deleteEditPhotos, uploadEditPhoto } from "@/lib/upload-photo";

/** Small "Add photo" button for Nano Edit. */
export const PhotoAttachButton: FC = () => {
  const { photos, addPhoto } = useNanoImage();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const full = photos.length >= MAX_EDIT_PHOTOS;

  async function onFiles(files: FileList | null) {
    if (!files) return;
    setError("");
    setBusy(true);
    try {
      for (const file of Array.from(files).slice(0, MAX_EDIT_PHOTOS - photos.length)) {
        addPhoto(await uploadEditPhoto(file));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add that photo.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={busy || full}
        onClick={() => input.current?.click()}
        title={full ? "You can add up to 2 photos" : "Add a photo to edit (add 2 for outfit try-on)"}
        className="press ring-ink/10 bg-paper text-ink/70 hover:text-ink my-2.5 mr-1 inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold ring-1 transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2Icon className="size-4 animate-spin" /> : <ImagePlusIcon className="size-4" />}
        Edit photo
      </button>
      {error && (
        <span role="alert" className="basis-full px-2 pb-2 text-xs text-red-600">
          {error}
        </span>
      )}
    </>
  );
};

/** Thumbnails of attached photos, shown above the text box. */
export const PhotoStrip: FC = () => {
  const { photos, removePhoto } = useNanoImage();
  if (photos.length === 0) return null;
  return (
    <div className="flex w-full basis-full flex-wrap items-center gap-2 px-2 pt-3">
      {photos.map((p, i) => (
        <div key={p.path} className="ring-ink/10 relative size-16 overflow-hidden rounded-xl ring-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.preview} alt={`Photo ${i + 1}`} className="size-full object-cover" />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => {
              removePhoto(p.path);
              void deleteEditPhotos([p.path]);
            }}
            className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-black/65 text-white"
          >
            <XIcon className="size-3" />
          </button>
        </div>
      ))}
      <span className="text-ink/55 text-xs">
        {photos.length === 1
          ? "Now type what to change. Add a 2nd photo (e.g. clothes) for try-on."
          : "Photo 1 = the person, photo 2 = the clothes. Type: “Put the clothes from photo 2 on the person in photo 1”."}
      </span>
    </div>
  );
};
