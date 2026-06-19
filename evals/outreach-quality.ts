import { createTestRepositories } from "@/server/repositories";
import { createServices } from "@/server/services";
import { ProfileStructuredSchema } from "@/lib/domain";
import { fixtures } from "@/server/fixtures";
import type { EvalCase, EvalSet } from "./types";

const SPAM = /to whom it may concern|dear sir|dear madam|guarantee|act now|limited time|world[- ]class rockstar/i;
const FABRICATED_EMPLOYMENT = /i (work|worked) at northwind|my (time|role) at northwind/i;

/** Outreach rubric: specific, grounded, concise, non-spammy, no hallucinations. */
export const outreachQualityEval: EvalSet = {
  name: "outreach-quality",
  threshold: 0.99,
  async run(): Promise<EvalCase[]> {
    const { repositories } = createTestRepositories();
    const services = createServices({ repositories });
    const out = await services.draftOutreach({
      profileId: "demo-profile",
      jobId: "job-northwind-fe",
      target: { archetype: "Hiring manager", rationale: "Owns the role." },
      channel: "email",
    });

    const structured = ProfileStructuredSchema.parse(fixtures.profiles[0].structured);
    const skills = structured.skills.map((s) => s.toLowerCase());

    const cases: EvalCase[] = [
      {
        name: "produces warm/direct/brief tone variants",
        passed: ["warm", "direct", "brief"].every((t) => out.drafts.some((d) => d.tone === t)),
      },
    ];

    for (const d of out.drafts) {
      const body = d.body.toLowerCase();
      cases.push({
        name: `[${d.tone}] grounded in the candidate's real skills`,
        passed: skills.some((s) => body.includes(s)),
      });
      cases.push({
        name: `[${d.tone}] concise (< 900 chars)`,
        passed: d.body.length < 900,
        note: `${d.body.length} chars`,
      });
      cases.push({
        name: `[${d.tone}] not generic AI-spam`,
        passed: !SPAM.test(d.body),
      });
      cases.push({
        name: `[${d.tone}] no fabricated employment at the target company`,
        passed: !FABRICATED_EMPLOYMENT.test(d.body),
      });
    }

    return cases;
  },
};
