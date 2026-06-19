import { getRepositories } from "@/server/repositories";
import type { Repositories } from "@/server/repositories";
import { getStorage } from "@/server/storage";
import type { StorageAdapter } from "@/server/storage";
import { getTextExtractor } from "@/server/resume/extractor";
import type { TextExtractor } from "@/server/resume/extractor";
import { getStructuredExtractor } from "@/server/resume/structured";
import type { StructuredExtractor } from "@/server/resume/structured";

/**
 * Dependency container for the services. Holds the data source and the résumé
 * pipeline providers today; later phases add LLM/embeddings/web-search behind
 * their own interfaces. Each is overridable for tests.
 */
export interface ServiceDeps {
  repositories: Repositories;
  storage: StorageAdapter;
  extractor: TextExtractor;
  structured: StructuredExtractor;
}

export function createDeps(overrides: Partial<ServiceDeps> = {}): ServiceDeps {
  return {
    repositories: overrides.repositories ?? getRepositories(),
    storage: overrides.storage ?? getStorage(),
    extractor: overrides.extractor ?? getTextExtractor(),
    structured: overrides.structured ?? getStructuredExtractor(),
  };
}
