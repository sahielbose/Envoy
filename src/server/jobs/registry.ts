import type { JobDeps, JobHandler, JobResult } from "./types";
import { ingestionJob, matchRefreshJob } from "./handlers";

/** Job name → handler. Drives the dev scheduler and the Inngest functions. */
export const JOBS: Record<string, JobHandler> = {
  ingest: ingestionJob,
  "match-refresh": matchRefreshJob,
};

export function jobNames(): string[] {
  return Object.keys(JOBS);
}

export async function runJob(name: string, deps: JobDeps): Promise<JobResult> {
  const handler = JOBS[name];
  if (!handler) throw new Error(`Unknown job: ${name}`);
  return handler(deps);
}
