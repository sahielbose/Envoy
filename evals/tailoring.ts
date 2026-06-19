import { generateTailored, verifyTruthful } from "@/server/resume/tailor";
import { ProfileStructuredSchema } from "@/lib/domain";
import { fixtures } from "@/server/fixtures";
import type { EvalCase, EvalSet } from "./types";

/** Every claim in a tailored doc must trace to the base — no fabrication. */
export const tailoringEval: EvalSet = {
  name: "tailoring-no-fabrication",
  threshold: 1,
  async run(): Promise<EvalCase[]> {
    const structured = ProfileStructuredSchema.parse(fixtures.profiles[0].structured);
    const result = generateTailored({
      structured,
      summary: "Senior frontend engineer.",
      // Deliberately off-target role to stress-test fabrication.
      job: { title: "Backend Engineer", company: "Beacon", description: "Go Kubernetes Postgres" },
    });

    const tailored = result.resumeText.toLowerCase();
    const baseSkills = structured.skills.map((s) => s.toLowerCase()).sort();
    const lines = result.resumeText.split("\n");
    const skillsLine = lines[lines.indexOf("SKILLS") + 1] ?? "";
    const tailoredSkills = skillsLine
      .split(" · ")
      .map((s) => s.toLowerCase().trim())
      .filter(Boolean)
      .sort();

    return [
      {
        name: "every change traces to a base source",
        passed: result.changes.every((c) => verifyTruthful([c], result.baseText).ok),
      },
      {
        name: "tailored skills are a permutation of base skills (no new skills)",
        passed: JSON.stringify(tailoredSkills) === JSON.stringify(baseSkills),
      },
      {
        name: "all employers appear in the base résumé",
        passed: structured.experience.every((e) => tailored.includes(e.company.toLowerCase())),
      },
      {
        name: "diff summary asserts nothing was invented",
        passed: /nothing invented|only your real/i.test(result.diffSummary),
      },
    ];
  },
};
