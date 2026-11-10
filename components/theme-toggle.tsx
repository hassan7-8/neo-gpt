"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { loadPrefs, savePref } from "@/lib/prefs";

function apply(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

/** Light / dark switch. Remembered on this device and on the account. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let d = window.matchMedia("(prefers-color-scheme: dark)").matches;
    try {
      const v = localStorage.getItem("cm-theme");
      if (v) d = v === "dark";
    } catch {}
    setDark(d);
    apply(d);
    void loadPrefs().then((p) => {
      if (p.theme === "dark" || p.theme === "light") {
        setDark(p.theme === "dark");
        apply(p.theme === "dark");
      }
    });
  }, []);

  return (
    <button
      type="button"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => {
        const next = !dark;
        setDark(next);
        apply(next);
        try { localStorage.setItem("cm-theme", next ? "dark" : "light"); } catch {}
        void savePref("theme", next ? "dark" : "light");
      }}
      className="press ring-ink/10 bg-paper text-ink/70 hover:text-ink flex size-9 items-center justify-center rounded-xl ring-1"
    >
      {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
      <span className="sr-only">Toggle dark mode</span>
    </button>
  );
}
