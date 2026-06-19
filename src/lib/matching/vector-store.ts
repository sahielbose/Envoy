import { cosineSimilarity } from "./embeddings";

export interface SimilarityHit {
  id: string;
  score: number;
}

/**
 * Vector index. Mock = in-memory cosine; Phase 20 = pgvector. The retrieve step
 * upserts job vectors and queries the profile vector against them.
 */
export interface VectorStore {
  upsert(id: string, vector: number[]): Promise<void>;
  query(vector: number[], k: number, restrictTo?: Iterable<string>): Promise<SimilarityHit[]>;
  clear(): Promise<void>;
}

export class MemoryVectorStore implements VectorStore {
  private readonly vectors = new Map<string, number[]>();

  async upsert(id: string, vector: number[]): Promise<void> {
    this.vectors.set(id, vector);
  }

  async query(vector: number[], k: number, restrictTo?: Iterable<string>): Promise<SimilarityHit[]> {
    const allow = restrictTo ? new Set(restrictTo) : null;
    const hits: SimilarityHit[] = [];
    for (const [id, vec] of this.vectors) {
      if (allow && !allow.has(id)) continue;
      hits.push({ id, score: cosineSimilarity(vector, vec) });
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, k);
  }

  async clear(): Promise<void> {
    this.vectors.clear();
  }
}
