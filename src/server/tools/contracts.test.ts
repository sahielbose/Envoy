import { describe, it, expect } from "vitest";
import { z } from "zod";
import { MatchResultSchema } from "@/lib/domain";
import { createServices } from "@/server/services";
import { createTestRepositories } from "@/server/repositories";
import * as C from "./contracts";
import { TOOL_CONTRACTS } from "./contracts";

function services() {
  const { repositories } = createTestRepositories();
  return createServices({ repositories });
}

describe("tool contract registry", () => {
  it("exposes a zod input + output schema and a description for every tool", () => {
    for (const [name, contract] of Object.entries(TOOL_CONTRACTS)) {
      expect(contract.description.length, name).toBeGreaterThan(0);
      expect(contract.input).toBeInstanceOf(z.ZodType);
      expect(contract.output).toBeInstanceOf(z.ZodType);
    }
  });
});

describe("mock services conform to their output contracts", () => {
  it("parse_resume", async () => {
    const out = await services().parseResume(C.ParseResumeInput.parse({ fileId: "file-1" }));
    expect(() => C.ParseResumeOutput.parse(out)).not.toThrow();
  });

  it("build_profile", async () => {
    const input = C.BuildProfileInput.parse({
      userId: "demo-user",
      structured: { name: "Alex", headline: "Senior Frontend Engineer", skills: ["React"] },
      preferences: { remote: true },
    });
    const out = await services().buildProfile(input);
    expect(() => C.BuildProfileOutput.parse(out)).not.toThrow();
    expect(out.summary.length).toBeGreaterThan(0);
  });

  it("find_roles returns conforming matches", async () => {
    const out = await services().findRoles(C.FindRolesInput.parse({ profileId: "demo-profile" }));
    expect(() => C.FindRolesOutput.parse(out)).not.toThrow();
    expect(out.matches.length).toBeGreaterThan(0);
    for (const m of out.matches) expect(() => MatchResultSchema.parse(m)).not.toThrow();
  });

  it("tailor_resume changes each trace to a source", async () => {
    const out = await services().tailorResume(
      C.TailorResumeInput.parse({ profileId: "demo-profile", jobId: "job-northwind-fe" }),
    );
    expect(() => C.TailorResumeOutput.parse(out)).not.toThrow();
    for (const change of out.changes) expect(change.source.length).toBeGreaterThan(0);
  });

  it("research_company returns a public-data dossier", async () => {
    const out = await services().researchCompany(C.ResearchCompanyInput.parse({ company: "Northwind" }));
    expect(() => C.ResearchCompanyOutput.parse(out)).not.toThrow();
    expect(out.likelyQuestions.length).toBeGreaterThan(0);
  });

  it("map_contacts returns archetypes (no scraped contact info)", async () => {
    const out = await services().mapContacts(
      C.MapContactsInput.parse({ profileId: "demo-profile", jobId: "job-northwind-fe" }),
    );
    expect(() => C.MapContactsOutput.parse(out)).not.toThrow();
    expect(out.targets.length).toBeGreaterThan(0);
  });

  it("draft_outreach returns tone variants and a rationale (draft only)", async () => {
    const out = await services().draftOutreach(
      C.DraftOutreachInput.parse({
        profileId: "demo-profile",
        jobId: "job-northwind-fe",
        target: { archetype: "Hiring manager", rationale: "Owns the decision." },
        channel: "email",
      }),
    );
    expect(() => C.DraftOutreachOutput.parse(out)).not.toThrow();
    expect(out.drafts.map((d) => d.tone).sort()).toEqual(["brief", "direct", "warm"]);
    expect(out.rationale.length).toBeGreaterThan(0);
  });

  it("track_application returns an application id", async () => {
    const out = await services().trackApplication(
      C.TrackApplicationInput.parse({
        userId: "demo-user",
        jobId: "job-cobalt-fullstack",
        stage: "researching",
      }),
    );
    expect(() => C.TrackApplicationOutput.parse(out)).not.toThrow();
    expect(out.applicationId).toBeTruthy();
  });
});

describe("contracts reject invalid data", () => {
  it("find_roles requires a profileId", () => {
    expect(C.FindRolesInput.safeParse({}).success).toBe(false);
  });

  it("match score must be within 0..1", () => {
    expect(MatchResultSchema.safeParse({ jobId: "j", score: 1.5, reasoning: "x" }).success).toBe(false);
  });

  it("track_application rejects an unknown stage", () => {
    expect(
      C.TrackApplicationInput.safeParse({ userId: "u", jobId: "j", stage: "bogus" }).success,
    ).toBe(false);
  });
});
