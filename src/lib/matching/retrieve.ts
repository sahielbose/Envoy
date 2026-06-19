import type { Job } from "@/server/repositories";
import type { JobFilterInput, Preferences, ProfileStructured } from "@/lib/domain";
import type { Embedder } from "./embeddings";
import { MemoryVectorStore } from "./vector-store";

export interface RetrieveHit {
  jobId: string;
  similarity: number;
}

export interface RetrieveInput {
  jobs: Job[];
  companyNames: Map<string, string>;
  structured: ProfileStructured;
  preferences: Preferences;
  query?: string;
  filters?: JobFilterInput;
  embedder: Embedder;
  k: number;
}

export function buildJobDocument(job: Job, companyName?: string): string {
  return [job.title, companyName ?? "", job.location ?? "", job.remote ? "remote" : "", job.description]
    .filter(Boolean)
    .join(" \n ");
}

export function buildProfileDocument(
  structured: ProfileStructured,
  preferences: Preferences,
  query?: string,
): string {
  const experience = structured.experience.flatMap((e) => [e.title, ...e.highlights]).join(" ");
  return [
    structured.headline,
    structured.skills.join(" "),
    experience,
    preferences.titles.join(" "),
    query ?? "",
  ]
    .filter(Boolean)
    .join(" \n ");
}

/** Hard preference filters applied before ranking (cheap, non-negotiable). */
export function passesHardFilters(
  job: Job,
  preferences: Preferences,
  filters?: JobFilterInput,
): boolean {
  const requireRemote =
    filters?.remote === true || preferences.mustHaves.some((m) => /remote/i.test(m));
  if (requireRemote && !job.remote) return false;

  const text = `${job.title} ${job.location ?? ""} ${job.description}`.toLowerCase();
  for (const dealbreaker of preferences.dealbreakers) {
    if (dealbreaker && text.includes(dealbreaker.toLowerCase())) return false;
  }
  return true;
}

/** Two-stage stage one: hard-filter, embed, and cosine-retrieve the top K. */
export async function retrieve(input: RetrieveInput): Promise<RetrieveHit[]> {
  const candidates = input.jobs.filter((job) =>
    passesHardFilters(job, input.preferences, input.filters),
  );
  if (candidates.length === 0) return [];

  const store = new MemoryVectorStore();
  const docs = candidates.map((job) =>
    buildJobDocument(job, input.companyNames.get(job.companyId ?? "")),
  );
  const vectors = await input.embedder.embed(docs);
  await Promise.all(candidates.map((job, i) => store.upsert(job.id, vectors[i])));

  const [profileVector] = await input.embedder.embed([
    buildProfileDocument(input.structured, input.preferences, input.query),
  ]);

  const hits = await store.query(
    profileVector,
    input.k,
    candidates.map((j) => j.id),
  );
  return hits.map((h) => ({ jobId: h.id, similarity: h.score }));
}
