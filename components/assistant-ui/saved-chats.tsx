"use client";

import { useMemo, useState, type FC } from "react";
import { PlusIcon, SearchIcon, Trash2Icon, Share2Icon, CheckIcon } from "lucide-react";
import { useSavedChats } from "@/lib/saved-chats";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Button } from "@/components/ui/button";

/** Sidebar: saved chats with search for logged-in users, plain session list for guests. */
export const SavedChatsList: FC = () => {
  const { enabled, guest, chats, chatId, setupNeeded, newChat, openChat, deleteChat } = useSavedChats();
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? chats.filter((c) => c.title.toLowerCase().includes(needle)) : chats;
  }, [chats, q]);

  if (!enabled) {
    return (
      <div className="flex flex-col gap-3">
        <ThreadList />
        {guest && (
          <p className="text-muted-foreground bg-muted/60 mx-1 rounded-xl px-3 py-2 text-xs">
            Log in (it&apos;s free) to save your chats and find them later on any device.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => void newChat()}
        variant="ghost"
        className="hover:bg-muted flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start"
      >
        <PlusIcon /> New chat
      </Button>

      <label className="bg-paper ring-ink/10 mx-1 flex items-center gap-2 rounded-xl px-3 py-2 ring-1">
        <SearchIcon className="text-ink/45 size-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your chats"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>

      {setupNeeded && (
        <p className="bg-coral/15 text-coral mx-1 rounded-xl px-3 py-2 text-xs">
          Saved chats need one setup step: run <b>supabase/chats.sql</b> in the Supabase SQL Editor.
        </p>
      )}

      <ul className="flex flex-col gap-0.5">
        {shown.map((c) => (
          <li
            key={c.id}
            className={`group hover:bg-muted flex items-center gap-1 rounded-lg transition-colors ${c.id === chatId ? "bg-muted" : ""}`}
          >
            <button
              type="button"
              onClick={() => void openChat(c.id)}
              dir="auto"
              className="min-w-0 flex-1 truncate px-3 py-2 text-start text-sm"
              title={c.title}
            >
              {c.title}
            </button>
            {c.share_id && <Share2Icon className="text-ink/40 size-3.5 shrink-0" aria-label="Shared" />}
            <button
              type="button"
              aria-label="Delete chat"
              title="Delete chat"
              onClick={() => confirm("Delete this chat for good?") && void deleteChat(c.id)}
              className="text-ink/50 hover:text-coral mr-2 shrink-0 p-1 opacity-60 transition group-hover:opacity-100"
            >
              <Trash2Icon className="size-3.5" />
            </button>
          </li>
        ))}
        {shown.length === 0 && !setupNeeded && (
          <li className="text-muted-foreground px-3 py-2 text-xs">
            {q ? "No chats match your search." : "Your chats will appear here after you send a message."}
          </li>
        )}
      </ul>
    </div>
  );
};

/** Header button: copies a public read-only link to the current chat. */
export const ShareChatButton: FC = () => {
  const { enabled, shareCurrent, chatId } = useSavedChats();
  const [state, setState] = useState<"idle" | "busy" | "copied" | "error">("idle");
  if (!enabled) return null;

  async function share() {
    setState("busy");
    const link = await shareCurrent();
    if (!link) return setState("error");
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: "Cheap Mind AI chat", url: link });
      } else {
        await navigator.clipboard.writeText(link);
      }
    } catch {
      /* user cancelled share sheet or clipboard blocked: the link still exists */
    }
    setState("copied");
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      disabled={state === "busy"}
      title={chatId ? "Copy a public link to this chat" : "Send a message first, then share"}
      className="press ring-ink/10 bg-paper text-ink/75 hover:text-ink flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold ring-1 disabled:opacity-60"
    >
      {state === "copied" ? <CheckIcon className="size-4" /> : <Share2Icon className="size-4" />}
      <span className="hidden sm:inline">
        {state === "copied" ? "Link copied" : state === "error" ? "Send a message first" : "Share"}
      </span>
    </button>
  );
};
