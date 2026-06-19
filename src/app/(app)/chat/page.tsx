import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Chat — Envoy" };

export default function ChatPage() {
  return (
    <>
      <PageHeader title="Chat" subtitle="Your career copilot — ask for roles, drafts, and research." />
      <Card>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          The conversational copilot arrives in a later phase.
        </p>
      </Card>
    </>
  );
}
