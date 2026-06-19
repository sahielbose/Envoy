import { LocalDiskStorage } from "./local-disk";
import type { StorageAdapter } from "./types";

export * from "./types";
export { LocalDiskStorage } from "./local-disk";
export { MemoryStorage } from "./memory";

let cached: StorageAdapter | null = null;

/**
 * The app's object storage. Mock-first uses local disk; Phase 20 swaps in the
 * real R2/Supabase adapter when !shouldMock("storage").
 */
export function getStorage(): StorageAdapter {
  if (!cached) cached = new LocalDiskStorage();
  return cached;
}
