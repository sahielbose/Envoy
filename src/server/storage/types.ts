export interface StoredFileMeta {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface StoredFile {
  bytes: Uint8Array;
  meta: StoredFileMeta;
}

/** Object storage for résumé files. Mock = local disk; Phase 20 = R2/Supabase. */
export interface StorageAdapter {
  put(input: { filename: string; contentType: string; bytes: Uint8Array }): Promise<StoredFileMeta>;
  get(fileId: string): Promise<StoredFile | null>;
}
