"use client";

import { useEffect, useState } from "react";
import { Volume2Icon, VolumeXIcon } from "lucide-react";
import { playKey, type KeyKind } from "@/lib/typing-sound";
import { loadPrefs, savePref } from "@/lib/prefs";

const IGNORED = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Escape"]);

/** Keyboard sound toggle. Only appears on computers (not touch phones); the choice follows the account. */
export function TypingSoundToggle() {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(true);

  useEffect(() => {
    const ok = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setSupported(ok);
    if (!ok) return;
    try {
      const v = localStorage.getItem("cm-sound");
      if (v) setOn(v === "1");
    } catch {}
    void loadPrefs().then((p) => {
      if (typeof p.typing_sound === "boolean") setOn(p.typing_sound);
    });
  }, []);

  useEffect(() => {
    if (!supported || !on) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || !(el.tagName === "TEXTAREA" || el.tagName === "INPUT" || el.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey || IGNORED.has(e.key)) return;
      const kind: KeyKind = e.key === " " ? "space" : e.key === "Enter" ? "enter" : e.key === "Backspace" ? "back" : "key";
      if (kind === "key" && e.key.length > 1) return;
      playKey(kind);
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [supported, on]);

  if (!supported) return null;
  return (
    <button
      type="button"
      aria-pressed={on}
      title={on ? "Typing sound on" : "Typing sound off"}
      onClick={() => {
        const next = !on;
        setOn(next);
        try { localStorage.setItem("cm-sound", next ? "1" : "0"); } catch {}
        void savePref("typing_sound", next);
        if (next) playKey("key");
      }}
      className="press ring-ink/10 bg-paper text-ink/70 hover:text-ink flex size-9 items-center justify-center rounded-xl ring-1"
    >
      {on ? <Volume2Icon className="size-4" /> : <VolumeXIcon className="size-4" />}
      <span className="sr-only">Typing sound</span>
    </button>
  );
}
