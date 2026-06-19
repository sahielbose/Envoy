import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { PageHeader } from "@/components/app/page-header";
import { SettingsForm, type SettingsState } from "@/components/app/settings-form";

export const metadata: Metadata = { title: "Settings — Envoy" };

export default async function SettingsPage() {
  const session = await getSession();
  const settings = session
    ? await getRepositories().settings.findByUserId(session.user.id)
    : null;

  const initial: SettingsState = {
    notifyEmail: settings?.notifyEmail ?? true,
    cronMatchWeekly: settings?.cronMatchWeekly ?? true,
    cronFollowups: settings?.cronFollowups ?? true,
    gmailConnected: settings?.gmailConnected ?? false,
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Notifications, reminders, and integrations." />
      <SettingsForm initial={initial} />
    </>
  );
}
