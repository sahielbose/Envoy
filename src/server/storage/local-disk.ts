import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { StorageAdapter, StoredFile, StoredFileMeta } from "./types";

/** Mock storage: writes résumé bytes + metadata to .data/uploads (gitignored). */
export class LocalDiskStorage implements StorageAdapter {
  constructor(private readonly baseDir = path.join(process.cwd(), ".data", "uploads")) {}

  async put({
    filename,
    contentType,
    bytes,
  }: {
    filename: string;
    contentType: string;
    bytes: Uint8Array;
  }): Promise<StoredFileMeta> {
    await fs.mkdir(this.baseDir, { recursive: true });
    const fileId = randomUUID();
    const meta: StoredFileMeta = { fileId, filename, contentType, size: bytes.byteLength };
    await fs.writeFile(path.join(this.baseDir, fileId), bytes);
    await fs.writeFile(path.join(this.baseDir, `${fileId}.json`), JSON.stringify(meta));
    return meta;
  }

  async get(fileId: string): Promise<StoredFile | null> {
    try {
      const bytes = await fs.readFile(path.join(this.baseDir, fileId));
      const metaRaw = await fs.readFile(path.join(this.baseDir, `${fileId}.json`), "utf8");
      return { bytes: new Uint8Array(bytes), meta: JSON.parse(metaRaw) as StoredFileMeta };
    } catch {
      return null;
    }
  }
}
