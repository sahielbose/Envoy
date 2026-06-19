import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { MatchesList, type MatchItem } from "@/components/app/matches-list";
import { Button } from "@/components/ui";

export const metadata: Metadata = { title: "Matches, Envoy" };

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];

export default async function MatchesPage() {
  const session = await getSession();
  const repos = getRepositories();
  const profile = session ? await repos.profiles.findByUserId(session.user.id) : null;

  if (!profile) {
    return (
      <>
        <PageHeader title="Matches" subtitle="Ranked roles with the reasoning behind each fit." />
        <EmptyState
          icon={Sparkles}
          title="No matches yet"
          description="Build your profile and Envoy will surface ranked roles here, each with the reasoning and gaps behind the fit."
          action={<Button href="/onboarding">Set up your profile</Button>}
        />
      </>
    );
  }

  // Run the pipeline (retrieve to rerank to persist), then read the ranked matches.
  await getServices().findRoles({ profileId: profile.id });
  const matches = (await repos.matches.listByProfile(profile.id)).filter(
    (m) => m.status !== "dismissed",
  );
  const jobs = await repos.jobs.findByIds(matches.map((m) => m.jobId));
  const jobById = new Map(jobs.map((j) => [j.id, j]));
  const companyById = new Map((await repos.companies.list()).map((c) => [c.id, c.name]));

  const items: MatchItem[] = matches.flatMap((m) => {
    const job = jobById.get(m.jobId);
    if (!job) return [];
    return [
      {
        matchId: m.id,
        status: m.status,
        score: m.score,
        reasoning: m.reasoning,
        gaps: asStringArray(m.gaps),
        title: job.title,
        company: companyById.get(job.companyId ?? "") ?? "Unknown",
        location: job.location,
        remote: job.remote,
        url: job.url,
      },
    ];
  });

  return (
    <>
      <PageHeader
        title="Matches"
        subtitle={`${items.length} ranked role${items.length === 1 ? "" : "s"} · each with reasoning and gaps`}
      />
      {items.length > 0 ? (
        <div style={{ maxWidth: 760 }}>
          <MatchesList items={items} />
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No matches right now"
          description="Envoy didn't find roles that clear your hard preferences. Loosen a filter or check back as new roles are ingested."
        />
      )}
    </>
  );
}
