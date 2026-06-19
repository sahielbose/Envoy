import type { Repositories } from "@/server/repositories";
import type { EnvoyServices } from "@/server/services";

export interface JobDeps {
  repositories: Repositories;
  services: EnvoyServices;
}

export interface JobResult {
  job: string;
  notifications: number;
  summary: string;
}

export type JobHandler = (deps: JobDeps) => Promise<JobResult>;
