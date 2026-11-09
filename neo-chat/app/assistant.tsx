"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/auth/user-menu";
import { NanoImageProvider, useNanoImage } from "@/lib/nano-image";

export const Assistant = () => (
  <NanoImageProvider>
    <AssistantInner />
  </NanoImageProvider>
);

const AssistantInner = () => {
  const { nanoRef, takePhotos } = useNanoImage();
  const runtime = useChatRuntime({
    api: "/api/chat",
    // Read on every request, so the Nano Image button takes effect immediately.
    headers: async () => {
      const photos = takePhotos();
      return {
        "x-nano-image": nanoRef.current ? "1" : "0",
        // Attached photos switch the request into photo-edit mode.
        "x-edit-images": photos.map((p) => p.url).join(","),
        "x-edit-paths": photos.map((p) => p.path).join(","),
      };
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="border-ink/5 bg-cream/80 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Logo />
            </div>
            <UserMenu />
          </header>
          <Thread />
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
