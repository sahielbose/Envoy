import type { JobUpsert } from "@/server/repositories";
import type { NormalizedJob } from "./types";

/** Strip tags + collapse whitespace from an HTML job description. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Heuristic remote detection from a location string. */
export function detectRemote(location: string | null | undefined): boolean {
  return /\b(remote|anywhere|distributed)\b/i.test(location ?? "");
}

/** Map a normalized job + resolved company to the repository upsert input. */
export function toJobUpsert(job: NormalizedJob, companyId: string | null): JobUpsert {
  return {
    source: job.source,
    sourceJobId: job.sourceJobId,
    companyId,
    title: job.title,
    location: job.location,
    remote: job.remote,
    description: job.description,
    url: job.url,
    postedAt: job.postedAt,
  };
}
