import type { JobSource, NormalizedJob } from "../types";
import { detectRemote } from "../normalize";

interface LeverPosting {
  id: string;
  text: string; // title
  hostedUrl: string;
  categories: { location?: string; commitment?: string; team?: string };
  descriptionPlain: string;
  createdAt: number; // epoch ms
}
interface LeverCompany {
  company: string;
  postings: LeverPosting[];
}

/** Mock Lever postings (api.lever.co/v0/postings/{company} shape). */
export const LEVER_COMPANIES: LeverCompany[] = [
  {
    company: "Lumen",
    postings: [
      {
        id: "lever-lumen-2002",
        text: "Product Designer",
        hostedUrl: "https://jobs.lever.co/lumen/2002",
        categories: { location: "New York, NY", commitment: "Full-time", team: "Design" },
        descriptionPlain:
          "Scaling our design team at a Series A fintech. Shape end-to-end product flows in Figma.",
        createdAt: 1779408000000,
      },
    ],
  },
  {
    company: "Drift House",
    postings: [
      {
        id: "lever-drift-5005",
        text: "Frontend Engineer",
        hostedUrl: "https://jobs.lever.co/drifthouse/5005",
        categories: { location: "Remote (US)", commitment: "Full-time" },
        descriptionPlain:
          "Build delightful, accessible interfaces for our collaboration product. React + TypeScript.",
        createdAt: 1779148800000,
      },
    ],
  },
];

export class LeverSource implements JobSource {
  readonly source = "lever";

  constructor(private readonly companies: LeverCompany[] = LEVER_COMPANIES) {}

  async fetchJobs(): Promise<NormalizedJob[]> {
    return this.companies.flatMap((c) =>
      c.postings.map((p) => ({
        source: this.source,
        sourceJobId: p.id,
        company: c.company,
        title: p.text,
        location: p.categories.location ?? null,
        remote: detectRemote(p.categories.location),
        description: p.descriptionPlain,
        url: p.hostedUrl,
        postedAt: new Date(p.createdAt),
      })),
    );
  }
}
