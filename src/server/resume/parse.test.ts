import { describe, it, expect } from "vitest";
import { StubTextExtractor } from "./extractor";
import { MockStructuredExtractor } from "./structured";
import { MemoryStorage } from "@/server/storage";
import { createServices } from "@/server/services";
import { createTestRepositories } from "@/server/repositories";
import { ParseResumeOutput } from "@/server/tools/contracts";

const SAMPLE = `Jordan Lee
Staff Backend Engineer
San Francisco, CA

Skills: Go, Postgres, Kubernetes

Experience
Acme — Staff Backend Engineer (2020–Present)
- Scaled the payments service to 10k rps.
`;

const bytes = (s: string) => new TextEncoder().encode(s);

describe("StubTextExtractor", () => {
  it("decodes text bytes to a string", async () => {
    const text = await new StubTextExtractor().extract({
      bytes: bytes("hello\nworld"),
      contentType: "text/plain",
      filename: "r.txt",
    });
    expect(text).toContain("hello");
  });
});

describe("MockStructuredExtractor", () => {
  it("pulls name + headline from the résumé text", async () => {
    const s = await new MockStructuredExtractor().extract(SAMPLE);
    expect(s.name).toBe("Jordan Lee");
    expect(s.headline.toLowerCase()).toContain("engineer");
  });

  it("falls back to a usable draft for empty text", async () => {
    const s = await new MockStructuredExtractor().extract("");
    expect(s.name.length).toBeGreaterThan(0);
    expect(s.skills.length).toBeGreaterThan(0);
  });
});

describe("parse_resume end-to-end (mock)", () => {
  it("stores then parses an uploaded résumé into a conforming profile", async () => {
    const storage = new MemoryStorage();
    const meta = await storage.put({
      filename: "jordan.txt",
      contentType: "text/plain",
      bytes: bytes(SAMPLE),
    });
    const { repositories } = createTestRepositories();
    const services = createServices({ repositories, storage });

    const out = await services.parseResume({ fileId: meta.fileId });
    expect(() => ParseResumeOutput.parse(out)).not.toThrow();
    expect(out.rawText).toContain("Jordan Lee");
    expect(out.structured.name).toBe("Jordan Lee");
  });

  it("falls back to the demo profile when the file is missing", async () => {
    const services = createServices({
      repositories: createTestRepositories().repositories,
      storage: new MemoryStorage(),
    });
    const out = await services.parseResume({ fileId: "missing" });
    expect(out.structured.name.length).toBeGreaterThan(0);
  });
});
