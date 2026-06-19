import { createDeps, type ServiceDeps } from "./deps";
import { createMockServices } from "./mock";
import type { EnvoyServices } from "./types";

export type { EnvoyServices } from "./types";
export type { ServiceDeps } from "./deps";
export { createDeps } from "./deps";

let cached: EnvoyServices | null = null;

/**
 * The app's services. Mock-first today; later phases swap individual provider
 * implementations behind the same EnvoyServices interface.
 */
export function getServices(): EnvoyServices {
  if (!cached) cached = createMockServices(createDeps());
  return cached;
}

/** Build a fresh service bundle; missing deps fall back to mock defaults. */
export function createServices(deps: Partial<ServiceDeps> = {}): EnvoyServices {
  return createMockServices(createDeps(deps));
}

export function resetServices(): void {
  cached = null;
}
