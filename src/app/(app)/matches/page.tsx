import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Matches — Envoy" };

export default function MatchesPage() {
  return (
    <>
      <PageHeader title="Matches" subtitle="Ranked roles with the reasoning behind each fit." />
      <Card>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Your ranked matches will appear here once your profile is built.
        </p>
      </Card>
    </>
  );
}
