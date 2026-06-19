import { env } from "@/lib/env";
import { detectRemote, stripHtml } from "./normalize";
import type { JobSource, NormalizedJob } from "./types";

function envList(name: string): string[] {
  return (process.env[name] ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const titleCase = (s: string) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Live Greenhouse public boards (boards-api.greenhouse.io). */
export class GreenhouseLiveSource implements JobSource {
  readonly source = "greenhouse";
  constructor(private readonly tokens: string[] = envList("GREENHOUSE_BOARDS")) {}

  async fetchJobs(): Promise<NormalizedJob[]> {
    const out: NormalizedJob[] = [];
    for (const token of this.tokens) {
      const res = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`,
      );
      if (!res.ok) continue;
      const data = (await res.json()) as {
        jobs: {
          id: number;
          title: string;
          updated_at: string;
          absolute_url: string;
          location?: { name?: string };
          content?: string;
        }[];
      };
      for (const j of data.jobs ?? []) {
        const loc = j.location?.name ?? null;
        out.push({
          source: this.source,
          sourceJobId: `gh-${token}-${j.id}`,
          company: titleCase(token),
          title: j.title,
          location: loc,
          remote: detectRemote(loc),
          description: stripHtml(j.content ?? ""),
          url: j.absolute_url,
          postedAt: j.updated_at ? new Date(j.updated_at) : null,
        });
      }
    }
    return out;
  }
}

/** Live Lever postings (api.lever.co). */
export class LeverLiveSource implements JobSource {
  readonly source = "lever";
  constructor(private readonly companies: string[] = envList("LEVER_COMPANIES")) {}

  async fetchJobs(): Promise<NormalizedJob[]> {
    const out: NormalizedJob[] = [];
    for (const company of this.companies) {
      const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`);
      if (!res.ok) continue;
      const data = (await res.json()) as {
        id: string;
        text: string;
        hostedUrl: string;
        categories?: { location?: string };
        descriptionPlain?: string;
        createdAt?: number;
      }[];
      for (const p of data ?? []) {
        const loc = p.categories?.location ?? null;
        out.push({
          source: this.source,
          sourceJobId: p.id,
          company: titleCase(company),
          title: p.text,
          location: loc,
          remote: detectRemote(loc),
          description: p.descriptionPlain ?? "",
          url: p.hostedUrl,
          postedAt: p.createdAt ? new Date(p.createdAt) : null,
        });
      }
    }
    return out;
  }
}

/** Live Ashby job boards (posting-api). */
export class AshbyLiveSource implements JobSource {
  readonly source = "ashby";
  constructor(private readonly boards: string[] = envList("ASHBY_BOARDS")) {}

  async fetchJobs(): Promise<NormalizedJob[]> {
    const out: NormalizedJob[] = [];
    for (const name of this.boards) {
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        jobs: {
          id: string;
          title: string;
          location?: string;
          descriptionPlain?: string;
          jobUrl: string;
          publishedAt?: string;
          isRemote?: boolean;
        }[];
      };
      for (const j of data.jobs ?? []) {
        const loc = j.location ?? null;
        out.push({
          source: this.source,
          sourceJobId: j.id,
          company: titleCase(name),
          title: j.title,
          location: loc,
          remote: Boolean(j.isRemote) || detectRemote(loc),
          description: j.descriptionPlain ?? "",
          url: j.jobUrl,
          postedAt: j.publishedAt ? new Date(j.publishedAt) : null,
        });
      }
    }
    return out;
  }
}

const ADZUNA_COUNTRY = process.env.ADZUNA_COUNTRY ?? "us";

/** Live Adzuna aggregate search (api.adzuna.com). */
export class AdzunaLiveSource implements JobSource {
  readonly source = "adzuna";

  constructor() {
    if (!env.ADZUNA_APP_ID || !env.ADZUNA_APP_KEY) {
      throw new Error("Adzuna requires ADZUNA_APP_ID and ADZUNA_APP_KEY.");
    }
  }

  async fetchJobs(): Promise<NormalizedJob[]> {
    const query = process.env.ADZUNA_QUERY ?? "engineer";
    const url =
      `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/1` +
      `?app_id=${env.ADZUNA_APP_ID}&app_key=${env.ADZUNA_APP_KEY}` +
      `&results_per_page=20&what=${encodeURIComponent(query)}&content-type=application/json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Adzuna failed: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as {
      results: {
        id: string;
        title: string;
        company?: { display_name?: string };
        location?: { display_name?: string };
        redirect_url: string;
        description?: string;
        created?: string;
      }[];
    };
    return (data.results ?? []).map((r) => {
      const loc = r.location?.display_name ?? null;
      return {
        source: this.source,
        sourceJobId: r.id,
        company: r.company?.display_name ?? "Unknown",
        title: r.title,
        location: loc,
        remote: detectRemote(loc),
        description: r.description ?? "",
        url: r.redirect_url,
        postedAt: r.created ? new Date(r.created) : null,
      };
    });
  }
}
