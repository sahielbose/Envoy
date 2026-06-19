import { describe, it, expect, beforeEach } from "vitest";
import { createTestRepositories } from "@/server/repositories";
import { createServices } from "@/server/services";
import {
  ingestionJob,
  matchRefreshJob,
  followupReminderJob,
  interviewReminderJob,
} from "./handlers";
import { runJob, jobNames } from "./registry";
import { getNotifications, clearNotifications } from "./notifications";

function deps() {
  const { repositories } = createTestRepositories();
  return { repositories, services: createServices({ repositories }) };
}

beforeEach(() => clearNotifications("demo-user"));

describe("background jobs (mock)", () => {
  it("ingestionJob populates jobs from the sources", async () => {
    const d = deps();
    const r = await ingestionJob(d);
    expect(r.notifications).toBe(0);
    expect(r.summary).toContain("Ingested");
    expect(await d.repositories.jobs.count()).toBeGreaterThan(6);
  });

  it("matchRefreshJob nudges about new matches", async () => {
    const r = await matchRefreshJob(deps());
    expect(r.notifications).toBeGreaterThan(0);
    expect(getNotifications("demo-user").some((n) => n.type === "match")).toBe(true);
  });

  it("followupReminderJob produces a follow-up nudge for a due application", async () => {
    const r = await followupReminderJob(deps());
    expect(r.notifications).toBeGreaterThan(0);
    expect(getNotifications("demo-user").some((n) => n.type === "followup")).toBe(true);
  });

  it("interviewReminderJob nudges an upcoming interview", async () => {
    const r = await interviewReminderJob(deps());
    expect(r.notifications).toBeGreaterThan(0);
    expect(getNotifications("demo-user").some((n) => n.type === "interview")).toBe(true);
  });

  it("runJob dispatches by name and rejects unknown jobs", async () => {
    const d = deps();
    expect(jobNames()).toContain("match-refresh");
    await expect(runJob("nope", d)).rejects.toThrow();
    expect((await runJob("match-refresh", d)).job).toBe("match-refresh");
  });
});
