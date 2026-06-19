import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";

export const metadata: Metadata = { title: "Settings — Envoy" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Preferences, notifications, and integrations." />
      <EmptyState
        icon={Settings}
        title="Nothing to configure yet"
        description="Notification preferences and optional integrations arrive in a later phase."
      />
    </>
  );
}
