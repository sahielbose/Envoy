import { getRepositories } from "@/server/repositories";
import type { Repositories } from "@/server/repositories";

/**
 * Dependency container for the services. Holds the data source today; later
 * phases add providers (LLM, embeddings, web search, storage) behind their own
 * interfaces. Each is overridable for tests.
 */
export interface ServiceDeps {
  repositories: Repositories;
}

export function createDeps(overrides: Partial<ServiceDeps> = {}): ServiceDeps {
  return {
    repositories: overrides.repositories ?? getRepositories(),
  };
}
