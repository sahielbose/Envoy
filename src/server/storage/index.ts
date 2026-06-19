import { shouldMock } from "@/lib/env";
import { LocalDiskStorage } from "./local-disk";
import { R2Storage } from "./r2";
import type { StorageAdapter } from "./types";

export * from "./types";
export { LocalDiskStorage } from "./local-disk";
export { MemoryStorage } from "./memory";

let cached: StorageAdapter | null = null;

/**
 * The app's object storage. Mock-first uses local disk; the real R2 (S3) adapter
 * is used when !shouldMock("storage").
 */
export function getStorage(): StorageAdapter {
  if (!cached) {
    cached = shouldMock("storage") ? new LocalDiskStorage() : new R2Storage();
  }
  return cached;
}
