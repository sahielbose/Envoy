import { describe, it, expect } from "vitest";
import { generateTailored, verifyTruthful, getDoc } from "./tailor";
import { renderPdf } from "./export/pdf";
import { renderDocx } from "./export/docx";
import { createServices } from "@/server/services";
import { createTestRepositories } from "@/server/repositories";
import { ProfileStructuredSchema } from "@/lib/domain";
import { fixtures } from "@/server/fixtures";

const structured = ProfileStructuredSchema.parse(fixtures.profiles[0].structured);

describe("tailoring (mock)", () => {
  it("produces a tailored résumé + cover letter + a traceable diff", () => {
    const result = generateTailored({
      structured,
      summary: "Senior frontend engineer.",
      job: {
        title: "Senior Frontend Engineer",
        company: "Northwind",
        description: "React TypeScript design systems remote",
      },
    });
    expect(result.resumeText).toContain(structured.name);
    expect(result.coverText.toLowerCase()).toContain("northwind");
    expect(result.changes.length).toBeGreaterThan(0);
    for (const c of result.changes) {
      expect(verifyTruthful([c], result.baseText).ok).toBe(true);
    }
  });

  it("never fabricates: only reorders base skills and keeps real employers", () => {
    const result = generateTailored({
      structured,
      summary: "x",
      job: { title: "Backend Engineer", company: "Beacon", description: "Go Kubernetes Postgres" },
    });
    const tailored = result.resumeText.toLowerCase();

    for (const exp of structured.experience) {
      expect(tailored).toContain(exp.company.toLowerCase());
    }

    const lines = result.resumeText.split("\n");
    const skillsLine = lines[lines.indexOf("SKILLS") + 1] ?? "";
    const tailoredSkills = skillsLine
      .split(" · ")
      .map((s) => s.toLowerCase().trim())
      .filter(Boolean)
      .sort();
    const baseSkills = structured.skills.map((s) => s.toLowerCase()).sort();
    expect(tailoredSkills).toEqual(baseSkills);
  });

  it("verifyTruthful rejects a change whose source is not in the base", () => {
    const base = "react typescript design systems";
    expect(verifyTruthful([{ section: "x", before: "a", after: "b", source: "react" }], base).ok).toBe(true);
    expect(
      verifyTruthful([{ section: "x", before: "a", after: "b", source: "kubernetes guru" }], base).ok,
    ).toBe(false);
  });
});

describe("tailor_resume service", () => {
  it("stores retrievable docs and only truthful changes", async () => {
    const { repositories } = createTestRepositories();
    const profile = await repositories.profiles.findByUserId("demo-user");
    if (!profile) throw new Error("seed profile missing");
    const out = await createServices({ repositories }).tailorResume({
      profileId: profile.id,
      jobId: "job-northwind-fe",
    });
    expect((getDoc(out.resumeDocId)?.text.length ?? 0) > 0).toBe(true);
    expect((getDoc(out.coverLetterDocId)?.text.length ?? 0) > 0).toBe(true);
    expect(out.changes.every((c) => c.source.length > 0)).toBe(true);
  });
});

describe("export", () => {
  it("renders a valid PDF", () => {
    const pdf = renderPdf("Alex Rivera\nSenior Frontend Engineer");
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
    expect(new TextDecoder().decode(pdf)).toContain("%%EOF");
  });

  it("renders a valid DOCX zip", () => {
    const docx = renderDocx("Alex Rivera\nSenior Frontend Engineer");
    expect([docx[0], docx[1], docx[2], docx[3]]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(new TextDecoder().decode(docx)).toContain("word/document.xml");
  });
});
