import type { JobSource, NormalizedJob } from "../types";
import { detectRemote } from "../normalize";

interface AdzunaResult {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  redirect_url: string;
  description: string;
  created: string; // ISO
}

/** Mock Adzuna aggregate results (api.adzuna.com search shape). */
export const ADZUNA_RESULTS: AdzunaResult[] = [
  {
    id: "adzuna-77001",
    title: "Backend Engineer",
    company: { display_name: "Beacon" },
    location: { display_name: "Remote" },
    redirect_url: "https://www.adzuna.com/details/77001",
    description: "Backend role in Go and Postgres at a remote-first startup.",
    created: "2026-05-17T00:00:00Z",
  },
  {
    id: "adzuna-77002",
    title: "Senior Frontend Engineer",
    company: { display_name: "Northwind" },
    location: { display_name: "Remote (US)" },
    redirect_url: "https://www.adzuna.com/details/77002",
    description: "Aggregated listing for Northwind's frontend role.",
    created: "2026-05-20T00:00:00Z",
  },
];

export class AdzunaSource implements JobSource {
  readonly source = "adzuna";

  constructor(private readonly results: AdzunaResult[] = ADZUNA_RESULTS) {}

  async fetchJobs(): Promise<NormalizedJob[]> {
    return this.results.map((r) => ({
      source: this.source,
      sourceJobId: r.id,
      company: r.company.display_name,
      title: r.title,
      location: r.location.display_name ?? null,
      remote: detectRemote(r.location.display_name),
      description: r.description,
      url: r.redirect_url,
      postedAt: r.created ? new Date(r.created) : null,
    }));
  }
}
