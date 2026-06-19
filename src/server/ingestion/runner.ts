import { shouldMock } from "@/lib/env";
import { getRepositories, type Repositories } from "@/server/repositories";
import { toJobUpsert } from "./normalize";
import { GreenhouseSource } from "./sources/greenhouse";
import { LeverSource } from "./sources/lever";
import { AshbySource } from "./sources/ashby";
import { AdzunaSource } from "./sources/adzuna";
import { GreenhouseLiveSource, LeverLiveSource, AshbyLiveSource } from "./live";
import type { JobSource } from "./types";

export function defaultSources(): JobSource[] {
  if (shouldMock("jobs")) {
    return [new GreenhouseSource(), new LeverSource(), new AshbySource(), new AdzunaSource()];
  }
  // Live public boards (no key). Adzuna live is added in the next commit.
  return [new GreenhouseLiveSource(), new LeverLiveSource(), new AshbyLiveSource()];
}

export interface IngestionResult {
  fetched: number;
  upserted: number;
  companies: number;
  bySource: Record<string, number>;
}

/**
 * Fetch from every source, resolve companies by name, and upsert each job.
 * Dedupe is by (source, sourceJobId): re-running is idempotent.
 */
export async function runIngestion(
  opts: { sources?: JobSource[]; repositories?: Repositories } = {},
): Promise<IngestionResult> {
  const sources = opts.sources ?? defaultSources();
  const repositories = opts.repositories ?? getRepositories();

  const companyIds = new Map<string, string>();
  const bySource: Record<string, number> = {};
  let fetched = 0;
  let upserted = 0;

  for (const source of sources) {
    const jobs = await source.fetchJobs();
    fetched += jobs.length;
    bySource[source.source] = (bySource[source.source] ?? 0) + jobs.length;

    for (const job of jobs) {
      let companyId = companyIds.get(job.company);
      if (!companyId) {
        const company = await repositories.companies.upsert({ name: job.company });
        companyId = company.id;
        companyIds.set(job.company, companyId);
      }
      await repositories.jobs.upsertBySource(toJobUpsert(job, companyId));
      upserted += 1;
    }
  }

  return { fetched, upserted, companies: companyIds.size, bySource };
}
