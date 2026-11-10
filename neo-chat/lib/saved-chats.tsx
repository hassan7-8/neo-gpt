"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ExportedMessageRepository, useAssistantRuntime, type ThreadMessage } from "@assistant-ui/react";
import { createClient } from "@/lib/supabase/client";
import { authConfigured } from "@/lib/supabase/config";

export type SavedChat = { id: string; title: string; updated_at: string; share_id: string | null };
type Stored = { role: "user" | "assistant"; text: string };

type Ctx = {
  /** True when saving is possible (Supabase set up and the user is logged in). */
  enabled: boolean;
  /** Supabase is configured but the user is a guest. */
  guest: boolean;
  chats: SavedChat[];
  chatId: string | null;
  ready: boolean;
  /** Set when the database table is missing, so the UI can say what to do. */
  setupNeeded: boolean;
  newChat: () => Promise<void>;
  openChat: (id: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  /** Returns a public link to the current chat, or null if it cannot be shared yet. */
  shareCurrent: () => Promise<string | null>;
};

const SavedCtx = createContext<Ctx | null>(null);

function toStored(messages: readonly ThreadMessage[]): Stored[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      text: m.content
        .map((p) => (p.type === "text" ? p.text : ""))
        .join("")
        // Edited photos live only in the browser, so keep a note instead of a broken picture.
        .replace(/!\[([^\]]*)\]\(\/api\/edit[^)]*\)/g, "[Edited photo: $1]")
        .slice(0, 8000),
    }))
    .filter((m) => m.text.trim())
    .slice(-200);
}

function randomId(n: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
}

export function SavedChatsProvider({ children }: { children: ReactNode }) {
  const runtime = useAssistantRuntime();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [chats, setChats] = useState<SavedChat[]>([]);
  const [chatId, setChatIdState] = useState<string | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const chatIdRef = useRef<string | null>(null);
  const lastSig = useRef("");
  const chatsRef = useRef<SavedChat[]>([]);
  chatsRef.current = chats;

  const setChatId = useCallback((id: string | null) => {
    chatIdRef.current = id;
    setChatIdState(id);
  }, []);

  // Who is logged in?
  useEffect(() => {
    if (!authConfigured) return setReady(true);
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) return setChats([]);
    const { data, error } = await createClient()
      .from("chats")
      .select("id,title,updated_at,share_id")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) return setSetupNeeded(/relation|does not exist|schema cache/i.test(error.message));
    setSetupNeeded(false);
    setChats(data ?? []);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    const stored = toStored(runtime.thread.getState().messages);
    if (stored.length === 0) return false;
    const sig = JSON.stringify(stored);
    let id = chatIdRef.current;
    if (id && sig === lastSig.current) return true;
    if (!id) {
      id = crypto.randomUUID();
      setChatId(id);
    }
    lastSig.current = sig;
    const existing = chatsRef.current.find((c) => c.id === id);
    const title = existing?.title ?? (stored.find((m) => m.role === "user")?.text ?? "New chat").replace(/\s+/g, " ").slice(0, 60);
    const { error } = await createClient()
      .from("chats")
      .upsert({ id, user_id: userId, title, messages: stored, updated_at: new Date().toISOString() });
    if (error) {
      lastSig.current = "";
      setSetupNeeded(/relation|does not exist|schema cache/i.test(error.message));
      return false;
    }
    void refresh();
    return true;
  }, [userId, runtime, refresh, setChatId]);

  // Auto-save a moment after the conversation stops changing.
  useEffect(() => {
    if (!userId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = runtime.thread.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!runtime.thread.getState().isRunning) void saveNow();
      }, 1200);
    });
    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, [userId, runtime, saveNow]);

  const newChat = useCallback(async () => {
    setChatId(null);
    lastSig.current = "";
    await runtime.switchToNewThread();
  }, [runtime, setChatId]);

  const openChat = useCallback(
    async (id: string) => {
      const { data } = await createClient().from("chats").select("messages").eq("id", id).single();
      const stored = (data?.messages ?? []) as Stored[];
      await runtime.switchToNewThread();
      setChatId(id);
      lastSig.current = JSON.stringify(stored);
      runtime.thread.import(
        ExportedMessageRepository.fromArray(stored.map((m) => ({ role: m.role, content: [{ type: "text" as const, text: m.text }] }))),
      );
    },
    [runtime, setChatId],
  );

  const deleteChat = useCallback(
    async (id: string) => {
      await createClient().from("chats").delete().eq("id", id);
      if (chatIdRef.current === id) await newChat();
      void refresh();
    },
    [newChat, refresh],
  );

  const shareCurrent = useCallback(async () => {
    if (!userId) return null;
    if (!(await saveNow())) return null;
    const id = chatIdRef.current;
    if (!id) return null;
    let shareId = chatsRef.current.find((c) => c.id === id)?.share_id ?? null;
    if (!shareId) {
      shareId = randomId(10);
      const { error } = await createClient().from("chats").update({ share_id: shareId }).eq("id", id);
      if (error) return null;
      void refresh();
    }
    return `${window.location.origin}/s/${shareId}`;
  }, [userId, saveNow, refresh]);

  const value = useMemo<Ctx>(
    () => ({
      enabled: authConfigured && Boolean(userId),
      guest: authConfigured && ready && !userId,
      chats,
      chatId,
      ready,
      setupNeeded,
      newChat,
      openChat,
      deleteChat,
      shareCurrent,
    }),
    [userId, ready, chats, chatId, setupNeeded, newChat, openChat, deleteChat, shareCurrent],
  );
  return <SavedCtx.Provider value={value}>{children}</SavedCtx.Provider>;
}

export function useSavedChats() {
  const ctx = useContext(SavedCtx);
  if (!ctx) throw new Error("useSavedChats must be used inside SavedChatsProvider");
  return ctx;
}
