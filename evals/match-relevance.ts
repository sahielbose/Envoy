import { createTestRepositories } from "@/server/repositories";
import { createServices } from "@/server/services";
import type { EvalCase, EvalSet } from "./types";

// Labeled relevance for the seeded frontend/React engineer profile.
const RELEVANT = new Set([
  "job-northwind-fe",
  "job-cobalt-fullstack",
  "job-fathom-founding",
  "job-drift-frontend",
]);

/** Match quality: precision, reasoning quality, and no confidently-wrong picks. */
export const matchRelevanceEval: EvalSet = {
  name: "match-relevance",
  threshold: 0.99,
  async run(): Promise<EvalCase[]> {
    const { repositories } = createTestRepositories();
    const services = createServices({ repositories });
    const profile = await repositories.profiles.findByUserId("demo-user");
    const matches = profile ? (await services.findRoles({ profileId: profile.id })).matches : [];

    const top4 = matches.slice(0, 4);
    const precision = top4.length > 0 ? top4.filter((m) => RELEVANT.has(m.jobId)).length / top4.length : 0;

    const reasoningOk = matches.every((m) => m.reasoning.trim().length > 20);

    const pm = matches.find((m) => m.jobId === "job-northwind-pm");
    const topRelevant = Math.max(
      0,
      ...matches.filter((m) => RELEVANT.has(m.jobId)).map((m) => m.score),
    );

    return [
      {
        name: "precision@4 over labeled roles",
        passed: precision >= 1,
        score: precision,
        note: `precision ${precision.toFixed(2)}`,
      },
      {
        name: "every match carries specific, plain-English reasoning",
        passed: reasoningOk,
      },
      {
        name: "relevant roles outrank the off-target PM role",
        passed: !pm || topRelevant > pm.score,
        note: pm ? `PM ${pm.score} vs top ${topRelevant}` : "PM not surfaced",
      },
    ];
  },
};
