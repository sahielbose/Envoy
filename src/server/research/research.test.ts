import { describe, it, expect } from "vitest";
import { createServices } from "@/server/services";
import { createTestRepositories } from "@/server/repositories";
import { ResearchCompanyOutput } from "@/server/tools/contracts";
import { likelyQuestions } from "./dossier";
import { fixtures } from "@/server/fixtures";
import type { SearchResult, WebSearch } from "@/lib/search";

class CountingSearch implements WebSearch {
  calls = 0;
  async search(_query: string, opts?: { limit?: number }): Promise<SearchResult[]> {
    this.calls += 1;
    const n = opts?.limit ?? 5;
    return Array.from({ length: n }, (_, i) => ({
      title: `Public result ${i}`,
      url: `https://example.com/${i}`,
      snippet: `Public snippet ${i} about the company.`,
    }));
  }
}

describe("research_company (mock)", () => {
  it("returns a conforming dossier with public people + sources and no contact info", async () => {
    const { repositories } = createTestRepositories();
    const out = await createServices({ repositories }).researchCompany({
      company: "Northwind",
      jobId: "job-northwind-fe",
    });
    expect(() => ResearchCompanyOutput.parse(out)).not.toThrow();
    expect(out.dossier.people.length).toBeGreaterThan(0);
    expect(out.likelyQuestions.length).toBeGreaterThan(0);
    expect(out.questionsToAsk.length).toBeGreaterThan(0);
    expect(out.sources.length).toBeGreaterThan(0);

    const blob = JSON.stringify(out);
    expect(/@|\bphone\b|\b\d{3}[-.]\d{3}[-.]\d{4}\b/.test(blob)).toBe(false);
  });

  it("caches the dossier on the company (one web search across two calls)", async () => {
    const { repositories } = createTestRepositories();
    const search = new CountingSearch();
    const services = createServices({ repositories, search });

    await services.researchCompany({ company: "Acme Co" });
    await services.researchCompany({ company: "Acme Co" });

    expect(search.calls).toBe(1);
    const company = await repositories.companies.findByName("Acme Co");
    expect(company?.dossier).toBeTruthy();
    expect(company?.dossierAt).toBeTruthy();
  });

  it("tailors likely questions by role", () => {
    const fe = likelyQuestions(fixtures.jobs.find((j) => j.id === "job-northwind-fe"));
    const design = likelyQuestions(fixtures.jobs.find((j) => j.id === "job-lumen-designer"));
    expect(fe).not.toEqual(design);
    expect(design.join(" ").toLowerCase()).toContain("design");
  });
});
