import type { Metadata } from "next";
import { Columns3 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { NextActionSchema } from "@/lib/domain";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { TrackerBoard, type TrackerItem } from "@/components/app/tracker-board";
import { Button } from "@/components/ui";

export const metadata: Metadata = { title: "Tracker, Envoy" };

export default async function TrackerPage() {
  const session = await getSession();
  const repos = getRepositories();

  if (!session) {
    return (
      <>
        <PageHeader title="Tracker" subtitle="Every application, from saved to signed." />
        <EmptyState icon={Columns3} title="Sign in to track applications" />
      </>
    );
  }

  const apps = await repos.applications.listByUser(session.user.id);
  const jobs = await repos.jobs.findByIds(apps.map((a) => a.jobId));
  const jobById = new Map(jobs.map((j) => [j.id, j]));
  const companyById = new Map((await repos.companies.list()).map((c) => [c.id, c.name]));

  const items: TrackerItem[] = apps.map((a) => {
    const job = jobById.get(a.jobId);
    const na = NextActionSchema.safeParse(a.nextAction);
    return {
      id: a.id,
      stage: a.stage,
      company: job ? (companyById.get(job.companyId ?? "") ?? "Unknown") : "Unknown",
      role: job?.title ?? a.jobId,
      jobId: a.jobId,
      notes: a.notes,
      nextAction: na.success ? na.data : null,
      resumeAttached: Boolean(a.resumeFileId),
    };
  });

  return (
    <>
      <PageHeader title="Tracker" subtitle="Every application, from saved to signed." />
      {items.length > 0 ? (
        <TrackerBoard items={items} />
      ) : (
        <EmptyState
          icon={Columns3}
          title="Your pipeline is empty"
          description="Save a role to start tracking it through saved, outreach, interview, and offer."
          action={<Button href="/matches">See matches</Button>}
        />
      )}
    </>
  );
}
