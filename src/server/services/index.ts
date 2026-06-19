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

/** Build a fresh service bundle over explicit deps (tests / per-request). */
export function createServices(deps: ServiceDeps): EnvoyServices {
  return createMockServices(deps);
}

export function resetServices(): void {
  cached = null;
}
