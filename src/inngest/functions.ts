import { inngest } from "./client";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";
import {
  ingestionJob,
  matchRefreshJob,
  followupReminderJob,
  interviewReminderJob,
} from "@/server/jobs/handlers";

const deps = () => ({ repositories: getRepositories(), services: getServices() });

export const ingestFn = inngest.createFunction(
  { id: "ingest-jobs" },
  { cron: "0 6 * * *" }, // daily 06:00
  async () => ingestionJob(deps()),
);

export const matchRefreshFn = inngest.createFunction(
  { id: "match-refresh" },
  { cron: "0 7 * * 1" }, // weekly Monday 07:00
  async () => matchRefreshJob(deps()),
);

export const followupFn = inngest.createFunction(
  { id: "followup-reminder" },
  { cron: "0 9 * * *" }, // daily 09:00
  async () => followupReminderJob(deps()),
);

export const interviewFn = inngest.createFunction(
  { id: "interview-reminder" },
  { cron: "0 8 * * *" }, // daily 08:00
  async () => interviewReminderJob(deps()),
);

/** All Inngest functions, served in Phase 20. */
export const functions = [ingestFn, matchRefreshFn, followupFn, interviewFn];
