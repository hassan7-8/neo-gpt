import { createClient } from "@/lib/supabase/client";

export const PHOTO_BUCKET = "photo-edits";
export const AVATAR_BUCKET = "avatars";
const MAX_INPUT_BYTES = 12 * 1024 * 1024;

/** Shrinks a photo in the browser (also removes hidden location data) and returns a JPEG blob. */
export async function shrinkImage(file: File, maxSide: number, quality = 0.9): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error("Please choose a JPG, PNG or WebP photo.");
  }
  if (file.size > MAX_INPUT_BYTES) throw new Error("That photo is too large (max 12 MB).");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not read that photo.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
  if (!blob) throw new Error("Could not prepare that photo.");
  return blob;
}

export type UploadedPhoto = { path: string; url: string; preview: string };

/** Uploads a temporary photo for Nano Edit into the logged-in user's own folder. */
export async function uploadEditPhoto(file: File): Promise<UploadedPhoto> {
  const blob = await shrinkImage(file, 1280);
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Please log in to edit photos.");
  const path = `${data.user.id}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    cacheControl: "300",
  });
  if (error) {
    throw new Error(
      /bucket/i.test(error.message)
        ? "Photo storage isn't set up yet. Ask the site owner to run supabase/storage.sql."
        : error.message,
    );
  }
  const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return { path, url: pub.publicUrl, preview: URL.createObjectURL(blob) };
}

export async function deleteEditPhotos(paths: string[]) {
  if (paths.length === 0) return;
  try {
    await createClient().storage.from(PHOTO_BUCKET).remove(paths);
  } catch {
    /* best effort */
  }
}
