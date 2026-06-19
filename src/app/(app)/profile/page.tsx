import type { Metadata } from "next";
import { User } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";

export const metadata: Metadata = { title: "Profile — Envoy" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" subtitle="Your candidate profile, built from your résumé." />
      <EmptyState
        icon={User}
        title="No profile yet"
        description="Complete onboarding to build your profile. “Get discovered” stays off by default — you stay in control."
      />
    </>
  );
}
