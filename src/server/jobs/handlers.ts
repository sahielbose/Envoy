import { runIngestion } from "@/server/ingestion/runner";
import { addNotification } from "./notifications";
import type { JobDeps, JobResult } from "./types";

/** Scheduled ingestion: pull from all sources into the Job store. */
export async function ingestionJob(deps: JobDeps): Promise<JobResult> {
  const result = await runIngestion({ repositories: deps.repositories });
  return {
    job: "ingest",
    notifications: 0,
    summary: `Ingested ${result.upserted} jobs from ${Object.keys(result.bySource).length} sources.`,
  };
}

/** Weekly match refresh: re-rank for each profile and nudge about new matches. */
export async function matchRefreshJob(deps: JobDeps): Promise<JobResult> {
  const profiles = await deps.repositories.profiles.list();
  let notifications = 0;
  for (const profile of profiles) {
    await deps.services.findRoles({ profileId: profile.id });
    const fresh = (await deps.repositories.matches.listByProfile(profile.id)).filter(
      (m) => m.status === "new",
    ).length;
    if (fresh > 0) {
      addNotification(profile.userId, {
        type: "match",
        title: `${fresh} new match${fresh === 1 ? "" : "es"} this week`,
        body: "Envoy refreshed your matches — review the new roles and why each fits.",
      });
      notifications += 1;
    }
  }
  return {
    job: "match-refresh",
    notifications,
    summary: `Refreshed matches for ${profiles.length} profile(s).`,
  };
}
