"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { UploadedPhoto } from "@/lib/upload-photo";

export const MAX_EDIT_PHOTOS = 2;

type NanoImageContext = {
  /** True when the Nano Image button is switched on. */
  nano: boolean;
  setNano: (on: boolean) => void;
  /** Always-current value for use inside request callbacks. */
  nanoRef: { current: boolean };
  /** Photos attached for Nano Edit. */
  photos: UploadedPhoto[];
  addPhoto: (p: UploadedPhoto) => void;
  removePhoto: (path: string) => void;
  /** Returns the attached photos and clears them (called when a message is sent). */
  takePhotos: () => UploadedPhoto[];
  /** Photos shown inside sent messages, by message id (previews live for this visit). */
  sentPhotos: Record<string, string[]>;
  recordSent: (messageId: string, previews: string[]) => void;
};

const Ctx = createContext<NanoImageContext | null>(null);

export function NanoImageProvider({ children }: { children: ReactNode }) {
  const [nano, setNanoState] = useState(false);
  const nanoRef = useRef(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const photosRef = useRef<UploadedPhoto[]>([]);

  const [sentPhotos, setSentPhotos] = useState<Record<string, string[]>>({});
  const recordSent = useCallback((id: string, previews: string[]) => {
    setSentPhotos((m) => ({ ...m, [id]: previews }));
  }, []);

  const setNano = useCallback((on: boolean) => {
    nanoRef.current = on;
    setNanoState(on);
  }, []);
  const addPhoto = useCallback((p: UploadedPhoto) => {
    photosRef.current = [...photosRef.current, p].slice(0, MAX_EDIT_PHOTOS);
    setPhotos(photosRef.current);
  }, []);
  const removePhoto = useCallback((path: string) => {
    photosRef.current = photosRef.current.filter((x) => x.path !== path);
    setPhotos(photosRef.current);
  }, []);
  const takePhotos = useCallback(() => {
    const taken = photosRef.current;
    photosRef.current = [];
    setPhotos([]);
    return taken;
  }, []);

  const value = useMemo(
    () => ({ nano, setNano, nanoRef, photos, addPhoto, removePhoto, takePhotos, sentPhotos, recordSent }),
    [nano, setNano, photos, addPhoto, removePhoto, takePhotos, sentPhotos, recordSent],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNanoImage() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNanoImage must be used inside NanoImageProvider");
  return ctx;
}
