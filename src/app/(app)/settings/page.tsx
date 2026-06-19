import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Settings — Envoy" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Preferences, notifications, and integrations." />
      <Card>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Notification and integration settings arrive in a later phase.
        </p>
      </Card>
    </>
  );
}
