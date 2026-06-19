import { describe, it, expect } from "vitest";
import { MockEmbedder, embedText, cosineSimilarity } from "./embeddings";
import { passesHardFilters, retrieve } from "./retrieve";
import { MockReranker } from "./rerank";
import { runFindRoles } from "./pipeline";
import { createTestRepositories } from "@/server/repositories";
import { fixtures } from "@/server/fixtures";
import { PreferencesSchema, ProfileStructuredSchema } from "@/lib/domain";

const structured = ProfileStructuredSchema.parse(fixtures.profiles[0].structured);
const preferences = PreferencesSchema.parse(fixtures.profiles[0].preferences);
const companyNames = new Map(fixtures.companies.map((c) => [c.id, c.name]));

describe("embeddings", () => {
  it("are deterministic", () => {
    expect(embedText("react typescript")).toEqual(embedText("react typescript"));
  });

  it("place related text closer than unrelated text", () => {
    const profile = embedText("react typescript design systems frontend");
    const near = embedText("react typescript frontend engineer");
    const far = embedText("kubernetes golang backend infrastructure");
    expect(cosineSimilarity(profile, near)).toBeGreaterThan(cosineSimilarity(profile, far));
  });
});

describe("hard filters", () => {
  it("require remote when the profile must-haves do", () => {
    const remoteJob = fixtures.jobs.find((j) => j.id === "job-cobalt-fullstack");
    const onsiteJob = fixtures.jobs.find((j) => j.id === "job-lumen-designer");
    expect(passesHardFilters(remoteJob!, preferences)).toBe(true);
    expect(passesHardFilters(onsiteJob!, preferences)).toBe(false);
  });
});

describe("retrieve", () => {
  it("excludes hard-filtered roles and returns ranked candidates", async () => {
    const hits = await retrieve({
      jobs: fixtures.jobs,
      companyNames,
      structured,
      preferences,
      embedder: new MockEmbedder(),
      k: 25,
    });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.find((h) => h.jobId === "job-lumen-designer")).toBeUndefined();
  });
});

describe("rerank", () => {
  it("scores within 0..1, sorted desc, with reasoning + gaps", async () => {
    const candidates = fixtures.jobs
      .filter((j) => j.remote)
      .map((job) => ({ job, companyName: companyNames.get(job.companyId ?? ""), similarity: 0.3 }));
    const ranked = await new MockReranker().rerank({ structured, preferences, candidates });
    expect(ranked.length).toBe(candidates.length);
    for (const m of ranked) {
      expect(m.score).toBeGreaterThanOrEqual(0);
      expect(m.score).toBeLessThanOrEqual(1);
      expect(m.reasoning.length).toBeGreaterThan(0);
      expect(Array.isArray(m.gaps)).toBe(true);
    }
    const scores = ranked.map((m) => m.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});

describe("find_roles pipeline (end to end)", () => {
  it("ranks the seeded profile with reasoning + gaps, excludes dismissed, persists matches", async () => {
    const { repositories } = createTestRepositories();
    const profile = await repositories.profiles.findByUserId("demo-user");
    const deps = {
      repositories,
      embedder: new MockEmbedder(),
      reranker: new MockReranker(),
    };

    const matches = await runFindRoles(deps, { profileId: profile?.id ?? "" });
    expect(matches.length).toBeGreaterThan(0);

    const scores = matches.map((m) => m.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    for (const m of matches) {
      expect(m.score).toBeGreaterThanOrEqual(0);
      expect(m.score).toBeLessThanOrEqual(1);
      expect(m.reasoning.length).toBeGreaterThan(0);
    }

    // The dismissed Lumen match is excluded.
    expect(matches.find((m) => m.jobId === "job-lumen-designer")).toBeUndefined();

    // A frontend role outranks the adjacent PM role.
    const fe = matches.find((m) => m.jobId === "job-northwind-fe");
    const pm = matches.find((m) => m.jobId === "job-northwind-pm");
    expect(fe).toBeDefined();
    if (fe && pm) expect(fe.score).toBeGreaterThan(pm.score);

    // Matches are persisted.
    expect((await repositories.matches.listByProfile(profile?.id ?? "")).length).toBeGreaterThan(0);
  });
});
