/** A job normalized from any source, before company resolution. */
export interface NormalizedJob {
  source: string;
  sourceJobId: string;
  company: string;
  title: string;
  location: string | null;
  remote: boolean;
  description: string;
  url: string;
  postedAt: Date | null;
}

/**
 * A pluggable job source. Mock-first adapters read from board fixtures; Phase 20
 * swaps in live Greenhouse/Lever/Ashby/Adzuna fetches behind the same interface.
 */
export interface JobSource {
  readonly source: string;
  fetchJobs(): Promise<NormalizedJob[]>;
}
