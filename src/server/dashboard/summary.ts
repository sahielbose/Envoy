import type { Repositories } from "@/server/repositories";
import { NextActionSchema } from "@/lib/domain";

export interface DashboardMatch {
  jobId: string;
  score: number;
  title: string;
  company: string;
}
export interface DashboardDraft {
  id: string;
  jobLabel: string;
}
export interface DashboardAction {
  company: string;
  label: string;
  due?: string;
}

export interface DashboardSummary {
  newMatches: number;
  pendingApprovals: number;
  upcomingFollowUps: number;
  activeApplications: number;
  topMatches: DashboardMatch[];
  pendingDrafts: DashboardDraft[];
  upcomingActions: DashboardAction[];
}

export async function getDashboardSummary(
  repos: Repositories,
  ids: { userId: string; profileId: string },
): Promise<DashboardSummary> {
  const matches = (await repos.matches.listByProfile(ids.profileId)).filter(
    (m) => m.status !== "dismissed",
  );
  const outreach = await repos.outreach.listByUser(ids.userId);
  const drafts = outreach.filter((o) => o.status === "draft");
  const apps = await repos.applications.listByUser(ids.userId);
  const active = apps.filter((a) => a.stage !== "closed");
  const followUps = active.filter((a) => NextActionSchema.safeParse(a.nextAction).success);

  const jobIds = [
    ...new Set([
      ...matches.slice(0, 3).map((m) => m.jobId),
      ...drafts.map((o) => o.jobId),
      ...followUps.map((a) => a.jobId),
    ]),
  ];
  const jobs = await repos.jobs.findByIds(jobIds);
  const jobById = new Map(jobs.map((j) => [j.id, j]));
  const companyById = new Map((await repos.companies.list()).map((c) => [c.id, c.name]));
  const companyOf = (jobId: string) => {
    const job = jobById.get(jobId);
    return job ? (companyById.get(job.companyId ?? "") ?? "Unknown") : "Unknown";
  };

  return {
    newMatches: matches.filter((m) => m.status === "new").length,
    pendingApprovals: drafts.length,
    upcomingFollowUps: followUps.length,
    activeApplications: active.length,
    topMatches: matches.slice(0, 3).map((m) => ({
      jobId: m.jobId,
      score: m.score,
      title: jobById.get(m.jobId)?.title ?? "Role",
      company: companyOf(m.jobId),
    })),
    pendingDrafts: drafts.slice(0, 3).map((o) => {
      const job = jobById.get(o.jobId);
      return { id: o.id, jobLabel: job ? `${job.title} · ${companyOf(o.jobId)}` : o.jobId };
    }),
    upcomingActions: followUps.slice(0, 3).map((a) => {
      const na = NextActionSchema.safeParse(a.nextAction);
      return {
        company: companyOf(a.jobId),
        label: na.success ? na.data.label : "Follow up",
        due: na.success ? na.data.due : undefined,
      };
    }),
  };
}
