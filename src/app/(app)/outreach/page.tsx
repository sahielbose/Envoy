import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Outreach — Envoy" };

export default function OutreachPage() {
  return (
    <>
      <PageHeader
        title="Outreach"
        subtitle="Warm, personal drafts — approved by you before anything sends."
      />
      <Card>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Drafts await your review here. Envoy never sends without your approval.
        </p>
      </Card>
    </>
  );
}
