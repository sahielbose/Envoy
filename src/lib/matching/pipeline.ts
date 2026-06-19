import type { Repositories } from "@/server/repositories";
import {
  PreferencesSchema,
  ProfileStructuredSchema,
  type JobFilterInput,
  type MatchResult,
} from "@/lib/domain";
import type { Embedder } from "./embeddings";
import type { Reranker, RerankCandidate } from "./rerank";
import { retrieve } from "./retrieve";

export interface FindRolesDeps {
  repositories: Repositories;
  embedder: Embedder;
  reranker: Reranker;
}

export interface FindRolesInput {
  profileId: string;
  query?: string;
  filters?: JobFilterInput;
  limit?: number;
  /** Retrieve depth before rerank (default 25). */
  k?: number;
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];

/**
 * find_roles end to end: retrieve (vector + hard filters) → rerank (score +
 * reasoning + gaps) → persist as Match (preserving the user's saved/dismissed
 * status) → return the ranked, non-dismissed matches.
 */
export async function runFindRoles(
  deps: FindRolesDeps,
  input: FindRolesInput,
): Promise<MatchResult[]> {
  const profile = await deps.repositories.profiles.findById(input.profileId);
  if (!profile) return [];

  const structured = ProfileStructuredSchema.parse(profile.structured);
  const preferences = PreferencesSchema.parse(profile.preferences);

  const jobs = await deps.repositories.jobs.list({
    source: input.filters?.source,
    companyId: input.filters?.companyId,
  });
  const companies = await deps.repositories.companies.list();
  const companyNames = new Map(companies.map((c) => [c.id, c.name]));

  const hits = await retrieve({
    jobs,
    companyNames,
    structured,
    preferences,
    query: input.query,
    filters: input.filters,
    embedder: deps.embedder,
    k: input.k ?? 25,
  });

  const byId = new Map(jobs.map((j) => [j.id, j]));
  const candidates: RerankCandidate[] = [];
  for (const hit of hits) {
    const job = byId.get(hit.jobId);
    if (!job) continue;
    candidates.push({
      job,
      companyName: companyNames.get(job.companyId ?? ""),
      similarity: hit.similarity,
    });
  }

  const reranked = await deps.reranker.rerank({ structured, preferences, candidates });
  for (const match of reranked) {
    await deps.repositories.matches.upsert({
      profileId: input.profileId,
      jobId: match.jobId,
      score: match.score,
      reasoning: match.reasoning,
      gaps: match.gaps,
    });
  }

  const persisted = (await deps.repositories.matches.listByProfile(input.profileId)).filter(
    (m) => m.status !== "dismissed",
  );
  const limited = typeof input.limit === "number" ? persisted.slice(0, input.limit) : persisted;
  return limited.map((m) => ({
    jobId: m.jobId,
    score: m.score,
    reasoning: m.reasoning,
    gaps: asStringArray(m.gaps),
  }));
}
