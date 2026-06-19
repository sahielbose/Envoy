import { requireProvider, shouldMock } from "@/lib/env";
import { getPrisma } from "@/server/db";
import { fixtures } from "@/server/fixtures";
import { MockStore, type MockData } from "./mock-store";
import { createMockRepositories } from "./mock";
import { createPrismaRepositories } from "./prisma";
import type { Repositories } from "./types";

export * from "./types";
export { MockStore } from "./mock-store";

let cached: Repositories | null = null;

/**
 * The app's data source. USE_MOCKS (overridable via MOCK_DB) selects the
 * in-memory mock store, seeded from fixtures, or the Prisma-backed repos.
 */
export function getRepositories(): Repositories {
  if (cached) return cached;
  if (shouldMock("db")) {
    cached = createMockRepositories(new MockStore().seed(fixtures));
  } else {
    requireProvider("db");
    cached = createPrismaRepositories(getPrisma());
  }
  return cached;
}

/** Fresh, isolated mock repositories for tests (never touches a real DB). */
export function createTestRepositories(seed: MockData = fixtures): {
  repositories: Repositories;
  store: MockStore;
} {
  const store = new MockStore().seed(seed);
  return { repositories: createMockRepositories(store), store };
}

/** Clear the cached singleton (test isolation / provider re-selection). */
export function resetRepositories(): void {
  cached = null;
}
