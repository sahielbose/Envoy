import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";

export const metadata: Metadata = { title: "Chat — Envoy" };

export default function ChatPage() {
  return (
    <>
      <PageHeader title="Chat" subtitle="Your career copilot — ask for roles, drafts, and research." />
      <EmptyState
        icon={MessageSquare}
        title="Start a conversation"
        description="The conversational copilot that drives everything arrives in a later phase."
      />
    </>
  );
}
