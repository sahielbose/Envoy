import { describe, it, expect } from "vitest";
import { GreenhouseSource } from "./sources/greenhouse";
import { LeverSource } from "./sources/lever";
import { AshbySource } from "./sources/ashby";
import { AdzunaSource } from "./sources/adzuna";
import { runIngestion } from "./runner";
import { createTestRepositories } from "@/server/repositories";

describe("source normalization", () => {
  it("Greenhouse strips HTML and scopes sourceJobId", async () => {
    const jobs = await new GreenhouseSource().fetchJobs();
    const job = jobs.find((j) => j.sourceJobId === "gh-northwind-1001");
    expect(job).toBeDefined();
    expect(job?.company).toBe("Northwind");
    expect(job?.description).not.toContain("<");
    expect(job?.remote).toBe(true);
    expect(job?.postedAt).toBeInstanceOf(Date);
  });

  it("Lever maps epoch createdAt to a valid Date", async () => {
    const jobs = await new LeverSource().fetchJobs();
    expect(jobs[0].source).toBe("lever");
    expect(jobs[0].postedAt).toBeInstanceOf(Date);
    expect(Number.isNaN(jobs[0].postedAt?.getTime() ?? NaN)).toBe(false);
  });

  it("Ashby honors isRemote", async () => {
    const jobs = await new AshbySource().fetchJobs();
    expect(jobs[0].source).toBe("ashby");
    expect(jobs[0].remote).toBe(true);
  });

  it("Adzuna normalizes aggregate results", async () => {
    const jobs = await new AdzunaSource().fetchJobs();
    expect(jobs.every((j) => j.source === "adzuna")).toBe(true);
    expect(jobs.some((j) => j.company === "Beacon")).toBe(true);
  });
});

describe("ingestion runner", () => {
  it("populates jobs from all adapters and is idempotent", async () => {
    const { repositories } = createTestRepositories({ companies: [], jobs: [] });

    const first = await runIngestion({ repositories });
    expect(first.fetched).toBeGreaterThan(0);
    expect(await repositories.jobs.count()).toBe(first.fetched);
    expect(Object.keys(first.bySource).sort()).toEqual([
      "adzuna",
      "ashby",
      "greenhouse",
      "lever",
    ]);

    const second = await runIngestion({ repositories });
    expect(await repositories.jobs.count()).toBe(first.fetched);
    expect(second.upserted).toBe(first.fetched);
  });

  it("resolves companies without duplicates", async () => {
    const { repositories } = createTestRepositories({ companies: [], jobs: [] });
    await runIngestion({ repositories });
    const names = (await repositories.companies.list()).map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain("Northwind");
  });
});
