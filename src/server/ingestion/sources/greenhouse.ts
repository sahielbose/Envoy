import type { JobSource, NormalizedJob } from "../types";
import { detectRemote, stripHtml } from "../normalize";

interface GreenhouseJob {
  id: number;
  title: string;
  updated_at: string;
  absolute_url: string;
  location: { name: string };
  content: string; // HTML
}
interface GreenhouseBoard {
  token: string;
  company: string;
  jobs: GreenhouseJob[];
}

/** Mock Greenhouse board API responses (boards-api.greenhouse.io shape). */
export const GREENHOUSE_BOARDS: GreenhouseBoard[] = [
  {
    token: "northwind",
    company: "Northwind",
    jobs: [
      {
        id: 1001,
        title: "Senior Frontend Engineer",
        updated_at: "2026-05-20T00:00:00Z",
        absolute_url: "https://boards.greenhouse.io/northwind/jobs/1001",
        location: { name: "Remote (US)" },
        content: "<p>Build our new <b>customer platform</b> in React + TypeScript. Seed-stage, remote-first.</p>",
      },
      {
        id: 1006,
        title: "Senior Product Manager",
        updated_at: "2026-05-19T00:00:00Z",
        absolute_url: "https://boards.greenhouse.io/northwind/jobs/1006",
        location: { name: "Remote (US)" },
        content: "<p>Own the roadmap for our customer platform.</p>",
      },
    ],
  },
  {
    token: "fathom",
    company: "Fathom",
    jobs: [
      {
        id: 4004,
        title: "Founding Engineer",
        updated_at: "2026-05-12T00:00:00Z",
        absolute_url: "https://boards.greenhouse.io/fathom/jobs/4004",
        location: { name: "Remote (US)" },
        content: "<p>Join as one of the first engineers. Full ownership; React + TypeScript.</p>",
      },
    ],
  },
];

export class GreenhouseSource implements JobSource {
  readonly source = "greenhouse";

  constructor(private readonly boards: GreenhouseBoard[] = GREENHOUSE_BOARDS) {}

  async fetchJobs(): Promise<NormalizedJob[]> {
    return this.boards.flatMap((board) =>
      board.jobs.map((job) => ({
        source: this.source,
        sourceJobId: `gh-${board.token}-${job.id}`,
        company: board.company,
        title: job.title,
        location: job.location.name ?? null,
        remote: detectRemote(job.location.name),
        description: stripHtml(job.content),
        url: job.absolute_url,
        postedAt: job.updated_at ? new Date(job.updated_at) : null,
      })),
    );
  }
}
