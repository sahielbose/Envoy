import { describe, it, expect } from "vitest";
import { createServices } from "@/server/services";
import { createTestRepositories } from "@/server/repositories";
import { getDashboardSummary } from "@/server/dashboard/summary";

describe("track_application", () => {
  it("creates a role then advances it through stages", async () => {
    const { repositories } = createTestRepositories();
    const services = createServices({ repositories });

    const r1 = await services.trackApplication({
      userId: "demo-user",
      jobId: "job-fathom-founding",
      stage: "saved",
    });
    expect(r1.applicationId).toBeTruthy();

    const r2 = await services.trackApplication({
      userId: "demo-user",
      jobId: "job-fathom-founding",
      stage: "interviewing",
      note: "round 1 booked",
    });
    expect(r2.applicationId).toBe(r1.applicationId);

    const app = await repositories.applications.findById(r1.applicationId);
    expect(app?.stage).toBe("interviewing");
    expect(app?.notes).toBe("round 1 booked");
  });
});

describe("dashboard summary", () => {
  it("aggregates matches, approvals, follow-ups, and active applications", async () => {
    const { repositories } = createTestRepositories();
    const profile = await repositories.profiles.findByUserId("demo-user");
    if (!profile) throw new Error("seed profile missing");

    const s = await getDashboardSummary(repositories, {
      userId: "demo-user",
      profileId: profile.id,
    });

    // Fixtures: 3 "new" matches (northwind/fathom/drift), cobalt saved, lumen dismissed.
    expect(s.newMatches).toBe(3);
    expect(s.pendingApprovals).toBe(0);
    // 4 fixture applications, all active with a next action.
    expect(s.activeApplications).toBe(4);
    expect(s.upcomingFollowUps).toBe(4);
    expect(s.topMatches.length).toBeGreaterThan(0);
    expect(s.topMatches[0].company.length).toBeGreaterThan(0);
  });

  it("counts a draft as a pending approval", async () => {
    const { repositories } = createTestRepositories();
    const profile = await repositories.profiles.findByUserId("demo-user");
    if (!profile) throw new Error("seed profile missing");

    await repositories.outreach.create({
      userId: "demo-user",
      jobId: "job-northwind-fe",
      target: { archetype: "Hiring manager" },
      channel: "email",
      drafts: [{ tone: "warm", body: "Hi." }],
      status: "draft",
    });

    const s = await getDashboardSummary(repositories, {
      userId: "demo-user",
      profileId: profile.id,
    });
    expect(s.pendingApprovals).toBe(1);
    expect(s.pendingDrafts.length).toBe(1);
  });
});
