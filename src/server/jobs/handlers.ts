import { runIngestion } from "@/server/ingestion/runner";
import { NextActionSchema } from "@/lib/domain";
import { addNotification } from "./notifications";
import type { JobDeps, JobResult } from "./types";

const DUE_SOON_DAYS = 7;

function dueWithinDays(due: string | undefined, days: number): boolean {
  if (!due) return true; // no date → treat as actionable
  const ms = Date.parse(due);
  if (Number.isNaN(ms)) return true;
  const now = Date.parse("2026-06-01T00:00:00.000Z");
  return (ms - now) / (1000 * 60 * 60 * 24) <= days;
}

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

/** Follow-up reminders: nudge on active applications with a due next action. */
export async function followupReminderJob(deps: JobDeps): Promise<JobResult> {
  const profiles = await deps.repositories.profiles.list();
  let notifications = 0;
  for (const profile of profiles) {
    const apps = await deps.repositories.applications.listByUser(profile.userId);
    for (const app of apps) {
      if (app.stage === "closed") continue;
      const na = NextActionSchema.safeParse(app.nextAction);
      if (!na.success) continue;
      if (!dueWithinDays(na.data.due, DUE_SOON_DAYS)) continue;
      addNotification(profile.userId, {
        type: "followup",
        title: `Follow up: ${na.data.label}`,
        body: `Your next action on an application is due${na.data.due ? ` ${na.data.due}` : " soon"}.`,
      });
      notifications += 1;
    }
  }
  return {
    job: "followup-reminder",
    notifications,
    summary: `Sent ${notifications} follow-up nudge(s).`,
  };
}

/** Interview reminders: nudge when an interview is coming up, prep ready. */
export async function interviewReminderJob(deps: JobDeps): Promise<JobResult> {
  const profiles = await deps.repositories.profiles.list();
  let notifications = 0;
  for (const profile of profiles) {
    const apps = await deps.repositories.applications.listByUser(profile.userId);
    for (const app of apps) {
      if (app.stage !== "interviewing") continue;
      const na = NextActionSchema.safeParse(app.nextAction);
      const due = na.success ? na.data.due : undefined;
      if (!dueWithinDays(due, DUE_SOON_DAYS)) continue;
      addNotification(profile.userId, {
        type: "interview",
        title: "Interview coming up — prep ready",
        body: `You have an interview${due ? ` around ${due}` : " soon"}. Your dossier and likely questions are ready in Research.`,
      });
      notifications += 1;
    }
  }
  return {
    job: "interview-reminder",
    notifications,
    summary: `Sent ${notifications} interview reminder(s).`,
  };
}
