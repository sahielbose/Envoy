import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Research — Envoy" };

export default function ResearchPage() {
  return (
    <>
      <PageHeader
        title="Research"
        subtitle="Company and interviewer dossiers before every round."
      />
      <Card>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Dossiers will appear here once you start tracking roles.
        </p>
      </Card>
    </>
  );
}
