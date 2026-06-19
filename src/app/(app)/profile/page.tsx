import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Profile — Envoy" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" subtitle="Your candidate profile, built from your résumé." />
      <Card>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Complete onboarding to build your profile. “Get discovered” stays off by default.
        </p>
      </Card>
    </>
  );
}
