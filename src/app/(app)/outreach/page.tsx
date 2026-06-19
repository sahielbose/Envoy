import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import {
  OutreachQueue,
  type OutreachItem,
  type OutreachDraftItem,
  type RoleOption,
} from "@/components/app/outreach-queue";
import { Button } from "@/components/ui";

export const metadata: Metadata = { title: "Outreach — Envoy" };

export default async function OutreachPage() {
  const session = await getSession();
  const repos = getRepositories();
  const profile = session ? await repos.profiles.findByUserId(session.user.id) : null;

  if (!profile) {
    return (
      <>
        <PageHeader
          title="Outreach"
          subtitle="Warm, personal drafts — approved by you before anything sends."
        />
        <EmptyState
          icon={Mail}
          title="No drafts to review"
          description="Complete onboarding and find matches, then Envoy can draft outreach for you to approve."
          action={<Button href="/onboarding">Set up your profile</Button>}
        />
      </>
    );
  }

  await getServices().findRoles({ profileId: profile.id });
  const matches = (await repos.matches.listByProfile(profile.id)).filter(
    (m) => m.status !== "dismissed",
  );
  const records = (session ? await repos.outreach.listByUser(session.user.id) : []).filter(
    (o) => o.status === "draft" || o.status === "approved",
  );

  const jobIds = [...new Set([...matches.map((m) => m.jobId), ...records.map((o) => o.jobId)])];
  const jobs = await repos.jobs.findByIds(jobIds);
  const jobById = new Map(jobs.map((j) => [j.id, j]));
  const companyById = new Map((await repos.companies.list()).map((c) => [c.id, c.name]));
  const labelFor = (jobId: string) => {
    const job = jobById.get(jobId);
    if (!job) return jobId;
    return `${job.title} · ${companyById.get(job.companyId ?? "") ?? "Unknown"}`;
  };

  const items: OutreachItem[] = records.map((o) => {
    const target = (o.target ?? {}) as unknown as { archetype?: string };
    const drafts = Array.isArray(o.drafts) ? (o.drafts as unknown as OutreachDraftItem[]) : [];
    return {
      id: o.id,
      jobId: o.jobId,
      status: o.status,
      channel: o.channel,
      jobLabel: labelFor(o.jobId),
      targetLabel: target.archetype ?? "Hiring manager",
      drafts,
    };
  });

  const seen = new Set<string>();
  const options: RoleOption[] = [];
  for (const m of matches) {
    if (seen.has(m.jobId)) continue;
    seen.add(m.jobId);
    options.push({ jobId: m.jobId, label: labelFor(m.jobId) });
  }

  const settings = await repos.settings.findByUserId(session?.user.id ?? "");

  return (
    <>
      <PageHeader
        title="Outreach"
        subtitle="Warm, personal drafts — approved by you before anything sends."
      />
      <OutreachQueue
        items={items}
        options={options}
        gmailConnected={settings?.gmailConnected ?? false}
      />
    </>
  );
}
