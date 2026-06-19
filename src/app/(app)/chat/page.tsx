import type { Metadata } from "next";
import { ChatView } from "@/components/app/chat/chat-view";

export const metadata: Metadata = { title: "Chat, Envoy" };

export default function ChatPage() {
  return <ChatView />;
}
