import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";

export const metadata: Metadata = { title: "Résumé — Envoy" };

export default function ResumePage() {
  return (
    <>
      <PageHeader
        title="Résumé"
        subtitle="Truthful, per-posting tailoring of your résumé and cover letter."
      />
      <EmptyState
        icon={FileText}
        title="No base résumé yet"
        description="Upload a base résumé to get started. Envoy only rewords what's true — it never invents experience."
      />
    </>
  );
}
