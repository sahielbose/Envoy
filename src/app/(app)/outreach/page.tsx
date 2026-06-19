import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";

export const metadata: Metadata = { title: "Outreach — Envoy" };

export default function OutreachPage() {
  return (
    <>
      <PageHeader
        title="Outreach"
        subtitle="Warm, personal drafts — approved by you before anything sends."
      />
      <EmptyState
        icon={Mail}
        title="No drafts to review"
        description="Drafts await your review here. Envoy never sends anything without your explicit approval."
      />
    </>
  );
}
