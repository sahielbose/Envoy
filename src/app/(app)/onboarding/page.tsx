import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { OnboardingFlow } from "@/components/app/onboarding-flow";

export const metadata: Metadata = { title: "Set up your profile — Envoy" };

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        title="Set up your profile"
        subtitle="Upload your résumé, set your targets, and Envoy builds your profile — no rigid forms."
      />
      <OnboardingFlow />
    </>
  );
}
