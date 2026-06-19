import type { Metadata } from "next";
import { Columns3 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";

export const metadata: Metadata = { title: "Tracker — Envoy" };

export default function TrackerPage() {
  return (
    <>
      <PageHeader title="Tracker" subtitle="Every application, from saved to signed." />
      <EmptyState
        icon={Columns3}
        title="Your pipeline is empty"
        description="Save a role to start tracking it through saved, outreach, interview, and offer."
      />
    </>
  );
}
