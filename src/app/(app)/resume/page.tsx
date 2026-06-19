import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Résumé — Envoy" };

export default function ResumePage() {
  return (
    <>
      <PageHeader
        title="Résumé"
        subtitle="Truthful, per-posting tailoring of your résumé and cover letter."
      />
      <Card>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Upload a base résumé to get started — tailoring lands in a later phase.
        </p>
      </Card>
    </>
  );
}
