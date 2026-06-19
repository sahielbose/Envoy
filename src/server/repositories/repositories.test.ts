import { describe, it, expect, beforeEach } from "vitest";
import { createTestRepositories } from "./index";
import type { Repositories } from "./types";

let repos: Repositories;

beforeEach(() => {
  repos = createTestRepositories().repositories;
});

describe("jobs", () => {
  it("lists all seeded jobs and counts them", async () => {
    const jobs = await repos.jobs.list();
    expect(jobs).toHaveLength(6);
    expect(await repos.jobs.count()).toBe(6);
  });

  it("filters by remote and source", async () => {
    const remote = await repos.jobs.list({ remote: true });
    expect(remote.every((j) => j.remote)).toBe(true);
    expect(remote.length).toBeGreaterThan(0);

    const lever = await repos.jobs.list({ source: "lever" });
    expect(lever.every((j) => j.source === "lever")).toBe(true);
  });

  it("finds by id and by ids", async () => {
    expect((await repos.jobs.findById("job-northwind-fe"))?.title).toBe("Senior Frontend Engineer");
    const some = await repos.jobs.findByIds(["job-cobalt-fullstack", "missing", "job-fathom-founding"]);
    expect(some.map((j) => j.id).sort()).toEqual(["job-cobalt-fullstack", "job-fathom-founding"]);
  });

  it("upserts by source (create then update)", async () => {
    const created = await repos.jobs.upsertBySource({
      source: "greenhouse",
      sourceJobId: "gh-new-9999",
      title: "Staff Engineer",
      description: "desc",
      url: "https://example.com/9999",
    });
    expect(await repos.jobs.count()).toBe(7);
    const updated = await repos.jobs.upsertBySource({
      source: "greenhouse",
      sourceJobId: "gh-new-9999",
      title: "Staff Engineer (Platform)",
      description: "desc 2",
      url: "https://example.com/9999",
    });
    expect(updated.id).toBe(created.id);
    expect(updated.title).toBe("Staff Engineer (Platform)");
    expect(await repos.jobs.count()).toBe(7);
  });
});

describe("matches", () => {
  it("lists by profile sorted by score desc", async () => {
    const matches = await repos.matches.listByProfile("demo-profile");
    expect(matches).toHaveLength(5);
    const scores = matches.map((m) => m.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(matches[0].jobId).toBe("job-northwind-fe");
  });

  it("filters by status", async () => {
    const fresh = await repos.matches.listByProfile("demo-profile", "new");
    expect(fresh.every((m) => m.status === "new")).toBe(true);
    expect(fresh).toHaveLength(3);
  });

  it("sets status and upserts", async () => {
    const updated = await repos.matches.setStatus("match-northwind-fe", "saved");
    expect(updated.status).toBe("saved");

    const upserted = await repos.matches.upsert({
      profileId: "demo-profile",
      jobId: "job-northwind-pm",
      score: 0.7,
      reasoning: "Adjacent PM role.",
      gaps: ["Not an engineering role."],
    });
    expect(upserted.id).toBeDefined();
    expect(await repos.matches.findByProfileAndJob("demo-profile", "job-northwind-pm")).not.toBeNull();
  });
});

describe("applications", () => {
  it("lists by user and walks a role through stages", async () => {
    expect(await repos.applications.listByUser("demo-user")).toHaveLength(4);

    const created = await repos.applications.create({
      userId: "demo-user",
      jobId: "job-fathom-founding",
      stage: "saved",
    });
    expect(await repos.applications.listByUser("demo-user")).toHaveLength(5);

    const moved = await repos.applications.update(created.id, { stage: "researching" });
    expect(moved.stage).toBe("researching");
  });
});

describe("profiles / companies / settings", () => {
  it("reads and upserts a profile", async () => {
    const profile = await repos.profiles.findByUserId("demo-user");
    expect(profile?.id).toBe("demo-profile");

    const updated = await repos.profiles.upsert({
      userId: "demo-user",
      structured: { headline: "Staff Frontend Engineer" },
      preferences: { remote: true },
      summary: "Updated summary.",
    });
    expect(updated.summary).toBe("Updated summary.");
  });

  it("reads companies and settings", async () => {
    expect((await repos.companies.list()).length).toBe(5);
    expect((await repos.companies.findByName("Cobalt Labs"))?.id).toBe("co-cobalt");
    expect((await repos.settings.findByUserId("demo-user"))?.gmailConnected).toBe(false);
  });
});

describe("isolation", () => {
  it("mutations in one test bundle never leak into another", async () => {
    const a = createTestRepositories().repositories;
    await a.applications.create({ userId: "demo-user", jobId: "job-cobalt-fullstack" });
    expect(await a.applications.listByUser("demo-user")).toHaveLength(5);

    const b = createTestRepositories().repositories;
    expect(await b.applications.listByUser("demo-user")).toHaveLength(4);
  });
});
