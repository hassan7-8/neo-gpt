import type { Metadata } from "next";
import { Assistant } from "../assistant";

export const metadata: Metadata = {
  title: "Chat",
  alternates: { canonical: "/chat" },
  description: "Chat with Cheap Mind AI: fast answers and image generation in one clean screen.",
};

export default function ChatPage() {
  return <Assistant />;
}
