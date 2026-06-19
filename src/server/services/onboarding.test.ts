import { describe, it, expect } from "vitest";
import { createTestRepositories } from "@/server/repositories";
import { createServices } from "@/server/services";
import { MemoryStorage } from "@/server/storage";
import { PreferencesSchema, ProfileStructuredSchema } from "@/lib/domain";

describe("onboarding flow (mock)", () => {
  it("upload to parse to build_profile persists a profile and summary", async () => {
    const { repositories } = createTestRepositories({
      users: [
        {
          id: "u1",
          email: "jordan@example.com",
          name: "Jordan Lee",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ],
      profiles: [],
    });
    const storage = new MemoryStorage();
    const services = createServices({ repositories, storage });

    const meta = await storage.put({
      filename: "r.txt",
      contentType: "text/plain",
      bytes: new TextEncoder().encode("Jordan Lee\nStaff Backend Engineer\nSkills: Go"),
    });

    const { structured } = await services.parseResume({ fileId: meta.fileId });
    expect(structured.name).toBe("Jordan Lee");

    const built = await services.buildProfile({
      userId: "u1",
      structured,
      preferences: PreferencesSchema.parse({ titles: ["Staff Backend Engineer"], remote: true }),
    });
    expect(built.profileId).toBeTruthy();
    expect(built.summary.length).toBeGreaterThan(0);

    const profile = await repositories.profiles.findByUserId("u1");
    expect(profile).not.toBeNull();
    expect(profile?.summary).toBe(built.summary);
    expect(ProfileStructuredSchema.parse(profile?.structured).name).toBe("Jordan Lee");
  });
});
