import type { JobDeps, JobHandler, JobResult } from "./types";

/** Job name → handler. Populated as each scheduled function is added. */
export const JOBS: Record<string, JobHandler> = {};

export function registerJob(name: string, handler: JobHandler): void {
  JOBS[name] = handler;
}

export function jobNames(): string[] {
  return Object.keys(JOBS);
}

export async function runJob(name: string, deps: JobDeps): Promise<JobResult> {
  const handler = JOBS[name];
  if (!handler) throw new Error(`Unknown job: ${name}`);
  return handler(deps);
}
