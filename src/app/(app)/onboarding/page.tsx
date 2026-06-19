import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { OnboardingFlow } from "@/components/app/onboarding-flow";

export const metadata: Metadata = { title: "Set up your profile — Envoy" };

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        title="Set up your profile"
        subtitle="Step 1 · Upload your résumé and Envoy does its homework — no rigid forms."
      />
      <OnboardingFlow />
    </>
  );
}
