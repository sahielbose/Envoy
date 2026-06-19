import { getRepositories } from "@/server/repositories";
import type { Repositories } from "@/server/repositories";
import { getStorage } from "@/server/storage";
import type { StorageAdapter } from "@/server/storage";
import { getTextExtractor } from "@/server/resume/extractor";
import type { TextExtractor } from "@/server/resume/extractor";
import { getStructuredExtractor } from "@/server/resume/structured";
import type { StructuredExtractor } from "@/server/resume/structured";
import { getEmbedder } from "@/lib/matching/embeddings";
import type { Embedder } from "@/lib/matching/embeddings";
import { getReranker } from "@/lib/matching/rerank";
import type { Reranker } from "@/lib/matching/rerank";
import { getWebSearch } from "@/lib/search";
import type { WebSearch } from "@/lib/search";

/**
 * Dependency container for the services. Holds the data source, résumé pipeline,
 * and matching providers today; later phases add LLM/web-search behind their own
 * interfaces. Each is overridable for tests.
 */
export interface ServiceDeps {
  repositories: Repositories;
  storage: StorageAdapter;
  extractor: TextExtractor;
  structured: StructuredExtractor;
  embedder: Embedder;
  reranker: Reranker;
  search: WebSearch;
}

export function createDeps(overrides: Partial<ServiceDeps> = {}): ServiceDeps {
  return {
    repositories: overrides.repositories ?? getRepositories(),
    storage: overrides.storage ?? getStorage(),
    extractor: overrides.extractor ?? getTextExtractor(),
    structured: overrides.structured ?? getStructuredExtractor(),
    embedder: overrides.embedder ?? getEmbedder(),
    reranker: overrides.reranker ?? getReranker(),
    search: overrides.search ?? getWebSearch(),
  };
}
