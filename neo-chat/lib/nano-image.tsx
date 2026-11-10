"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { UploadedPhoto } from "@/lib/upload-photo";

export const MAX_EDIT_PHOTOS = 2;

export const PERSONAS = [
  { id: "study", label: "Study Buddy", emoji: "📚" },
  { id: "coder", label: "Coder", emoji: "💻" },
  { id: "writer", label: "Writer", emoji: "✍️" },
  { id: "translator", label: "Translator", emoji: "🌐" },
  { id: "interview", label: "Interview Coach", emoji: "🎤" },
] as const;

export const IMAGE_STYLES = [
  { id: "anime", label: "Anime" },
  { id: "3d", label: "3D" },
  { id: "watercolor", label: "Watercolor" },
  { id: "product", label: "Luxury product" },
  { id: "realistic", label: "Realistic" },
  { id: "pixel", label: "Pixel art" },
] as const;

export const PHOTO_TOOLS = [
  { label: "Remove background", prompt: "Remove the background and replace it with a clean plain white background" },
  { label: "Restore old photo", prompt: "Restore this old photo: fix scratches and fading, sharpen details, and add natural colour" },
  { label: "Cartoon me", prompt: "Turn this photo into a high-quality cartoon portrait, keep the face recognisable" },
  { label: "Passport photo", prompt: "Make this a passport-style photo: plain white background, face centred, even lighting" },
  { label: "Profile picture", prompt: "Make this a polished professional profile picture with soft blurred background and good lighting" },
] as const;

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
  /** Chosen helper (Study Buddy, Coder…) and image style, plus always-current refs. */
  persona: string;
  setPersona: (id: string) => void;
  personaRef: { current: string };
  style: string;
  setStyle: (id: string) => void;
  styleRef: { current: string };
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
  const [persona, setPersonaState] = useState("");
  const personaRef = useRef("");
  const setPersona = useCallback((id: string) => {
    personaRef.current = id;
    setPersonaState(id);
  }, []);
  const [style, setStyleState] = useState("");
  const styleRef = useRef("");
  const setStyle = useCallback((id: string) => {
    styleRef.current = id;
    setStyleState(id);
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
    () => ({ nano, setNano, nanoRef, photos, addPhoto, removePhoto, takePhotos, sentPhotos, recordSent, persona, setPersona, personaRef, style, setStyle, styleRef }),
    [nano, setNano, photos, addPhoto, removePhoto, takePhotos, sentPhotos, recordSent, persona, setPersona, style, setStyle],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNanoImage() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNanoImage must be used inside NanoImageProvider");
  return ctx;
}
