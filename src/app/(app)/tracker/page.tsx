import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Tracker — Envoy" };

export default function TrackerPage() {
  return (
    <>
      <PageHeader title="Tracker" subtitle="Every application, from saved to signed." />
      <Card>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Save a role to start tracking it through your pipeline.
        </p>
      </Card>
    </>
  );
}
