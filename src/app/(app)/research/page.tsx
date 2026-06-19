import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { ResearchView, type ResearchOption } from "@/components/app/research-view";
import { Button } from "@/components/ui";

export const metadata: Metadata = { title: "Research, Envoy" };

export default async function ResearchPage() {
  const session = await getSession();
  const repos = getRepositories();
  const profile = session ? await repos.profiles.findByUserId(session.user.id) : null;

  if (!profile) {
    return (
      <>
        <PageHeader title="Research" subtitle="Company and interviewer dossiers before every round." />
        <EmptyState
          icon={BookOpen}
          title="No dossiers yet"
          description="Complete onboarding, then Envoy can research the companies you're matched with."
          action={<Button href="/onboarding">Set up your profile</Button>}
        />
      </>
    );
  }

  await getServices().findRoles({ profileId: profile.id });
  const matches = (await repos.matches.listByProfile(profile.id)).filter(
    (m) => m.status !== "dismissed",
  );
  const jobs = await repos.jobs.findByIds(matches.map((m) => m.jobId));
  const jobById = new Map(jobs.map((j) => [j.id, j]));
  const companyById = new Map((await repos.companies.list()).map((c) => [c.id, c.name]));

  const seen = new Set<string>();
  const options: ResearchOption[] = [];
  for (const m of matches) {
    const job = jobById.get(m.jobId);
    if (!job) continue;
    const company = companyById.get(job.companyId ?? "") ?? "Unknown";
    if (seen.has(company)) continue;
    seen.add(company);
    options.push({ company, jobId: job.id, label: `${company} · ${job.title}` });
  }

  return (
    <>
      <PageHeader title="Research" subtitle="Company and interviewer dossiers before every round." />
      {options.length > 0 ? (
        <ResearchView options={options} />
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No companies to research yet"
          description="Once you have matches, pick a company here and Envoy will build a dossier."
          action={<Button href="/matches">See matches</Button>}
        />
      )}
    </>
  );
}
