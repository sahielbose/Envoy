import type { StorageAdapter, StoredFile, StoredFileMeta } from "./types";

/** In-memory storage for tests and ephemeral use. */
export class MemoryStorage implements StorageAdapter {
  private readonly files = new Map<string, StoredFile>();
  private seq = 0;

  async put({
    filename,
    contentType,
    bytes,
  }: {
    filename: string;
    contentType: string;
    bytes: Uint8Array;
  }): Promise<StoredFileMeta> {
    this.seq += 1;
    const fileId = `mem_${this.seq.toString().padStart(4, "0")}`;
    const meta: StoredFileMeta = { fileId, filename, contentType, size: bytes.byteLength };
    this.files.set(fileId, { bytes, meta });
    return meta;
  }

  async get(fileId: string): Promise<StoredFile | null> {
    return this.files.get(fileId) ?? null;
  }
}
