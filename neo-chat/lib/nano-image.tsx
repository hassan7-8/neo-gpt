"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type NanoImageContext = {
  /** True when the Nano Image button is switched on. */
  nano: boolean;
  setNano: (on: boolean) => void;
  /** Always-current value for use inside request callbacks. */
  nanoRef: { current: boolean };
};

const Ctx = createContext<NanoImageContext | null>(null);

export function NanoImageProvider({ children }: { children: ReactNode }) {
  const [nano, setNanoState] = useState(false);
  const nanoRef = useRef(false);
  const setNano = useCallback((on: boolean) => {
    nanoRef.current = on;
    setNanoState(on);
  }, []);
  const value = useMemo(() => ({ nano, setNano, nanoRef }), [nano, setNano]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNanoImage() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNanoImage must be used inside NanoImageProvider");
  return ctx;
}
