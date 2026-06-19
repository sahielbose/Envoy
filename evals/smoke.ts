import { createTestRepositories } from "@/server/repositories";
import { createServices } from "@/server/services";
import type { EvalCase, EvalSet } from "./types";

/** Sanity: the mock stack boots and find_roles returns matches. */
export const smokeEval: EvalSet = {
  name: "smoke",
  threshold: 1,
  async run(): Promise<EvalCase[]> {
    const { repositories } = createTestRepositories();
    const services = createServices({ repositories });
    const profile = await repositories.profiles.findByUserId("demo-user");
    const matches = profile ? (await services.findRoles({ profileId: profile.id })).matches : [];
    return [
      {
        name: "services boot and find_roles returns matches",
        passed: matches.length > 0,
        note: `${matches.length} matches`,
      },
    ];
  },
};
