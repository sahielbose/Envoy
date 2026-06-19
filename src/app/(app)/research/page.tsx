import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";

export const metadata: Metadata = { title: "Research — Envoy" };

export default function ResearchPage() {
  return (
    <>
      <PageHeader title="Research" subtitle="Company and interviewer dossiers before every round." />
      <EmptyState
        icon={BookOpen}
        title="No dossiers yet"
        description="Track a role and Envoy will prepare a dossier on the company, your interviewers, and likely questions."
      />
    </>
  );
}
