import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";

export const metadata: Metadata = { title: "Matches — Envoy" };

export default function MatchesPage() {
  return (
    <>
      <PageHeader title="Matches" subtitle="Ranked roles with the reasoning behind each fit." />
      <EmptyState
        icon={Sparkles}
        title="No matches yet"
        description="Build your profile and Envoy will surface ranked roles here, each with the reasoning and gaps behind the fit."
      />
    </>
  );
}
