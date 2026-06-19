import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { ResumeStudio, type RoleOption } from "@/components/app/resume-studio";
import { Button } from "@/components/ui";

export const metadata: Metadata = { title: "Résumé, Envoy" };

export default async function ResumePage() {
  const session = await getSession();
  const repos = getRepositories();
  const profile = session ? await repos.profiles.findByUserId(session.user.id) : null;

  if (!profile) {
    return (
      <>
        <PageHeader
          title="Résumé"
          subtitle="Truthful, per-posting tailoring of your résumé and cover letter."
        />
        <EmptyState
          icon={FileText}
          title="No base résumé yet"
          description="Upload a base résumé to get started. Envoy only rewords what's true, it never invents experience."
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

  const options: RoleOption[] = matches.flatMap((m) => {
    const job = jobById.get(m.jobId);
    if (!job) return [];
    const company = companyById.get(job.companyId ?? "") ?? "Unknown";
    return [{ jobId: job.id, label: `${job.title} · ${company}` }];
  });

  return (
    <>
      <PageHeader
        title="Résumé"
        subtitle="Truthful, per-posting tailoring of your résumé and cover letter."
      />
      {options.length > 0 ? (
        <ResumeStudio options={options} />
      ) : (
        <EmptyState
          icon={FileText}
          title="Find a role to tailor for"
          description="Once you have matches, pick one here and Envoy will tailor your résumé and cover letter to it."
          action={<Button href="/matches">See matches</Button>}
        />
      )}
    </>
  );
}
