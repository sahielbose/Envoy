import type { JobSource, NormalizedJob } from "../types";
import { detectRemote } from "../normalize";

interface AshbyJob {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  descriptionPlain: string;
  jobUrl: string;
  publishedAt: string;
  isRemote: boolean;
}
interface AshbyBoard {
  name: string;
  company: string;
  jobs: AshbyJob[];
}

/** Mock Ashby job-board responses (posting-api/job-board/{name} shape). */
export const ASHBY_BOARDS: AshbyBoard[] = [
  {
    name: "cobalt",
    company: "Cobalt Labs",
    jobs: [
      {
        id: "ashby-cobalt-3003",
        title: "Full-Stack Engineer",
        location: "Remote",
        employmentType: "FullTime",
        descriptionPlain:
          "Small, TypeScript-heavy team shipping fast. Node, Postgres, React. Seed-stage developer tool.",
        jobUrl: "https://jobs.ashbyhq.com/cobalt/3003",
        publishedAt: "2026-05-15T00:00:00Z",
        isRemote: true,
      },
    ],
  },
];

export class AshbySource implements JobSource {
  readonly source = "ashby";

  constructor(private readonly boards: AshbyBoard[] = ASHBY_BOARDS) {}

  async fetchJobs(): Promise<NormalizedJob[]> {
    return this.boards.flatMap((board) =>
      board.jobs.map((job) => ({
        source: this.source,
        sourceJobId: job.id,
        company: board.company,
        title: job.title,
        location: job.location ?? null,
        remote: job.isRemote || detectRemote(job.location),
        description: job.descriptionPlain,
        url: job.jobUrl,
        postedAt: job.publishedAt ? new Date(job.publishedAt) : null,
      })),
    );
  }
}
