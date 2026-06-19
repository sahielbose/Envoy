import { shouldMock } from "@/lib/env";
import { VoyageEmbedder } from "./voyage";

export const EMBED_DIM = 1024;

/** Embeddings provider. Mock = deterministic; Phase 20 = Voyage. */
export interface Embedder {
  readonly dim: number;
  embed(texts: string[]): Promise<number[][]>;
}

/** FNV-1a string hash → unsigned 32-bit. */
function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Deterministic bag-of-tokens embedding: hashes tokens into a fixed-dim,
 * L2-normalized vector. Shared vocabulary (skills, titles) → higher cosine
 * similarity, which makes the mock pipeline behave like a real one.
 */
export function embedText(text: string, dim = EMBED_DIM): number[] {
  const v = new Array<number>(dim).fill(0);
  const tokens = text.toLowerCase().match(/[a-z0-9+#.]+/g) ?? [];
  for (const token of tokens) {
    v[hash(token) % dim] += 1;
    v[hash(`${token}#2`) % dim] += 0.5;
  }
  let norm = 0;
  for (const x of v) norm += x * x;
  norm = Math.sqrt(norm) || 1;
  return v.map((x) => x / norm);
}

/** Cosine similarity for L2-normalized vectors (== dot product). */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot;
}

export class MockEmbedder implements Embedder {
  readonly dim = EMBED_DIM;
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => embedText(t, this.dim));
  }
}

let cached: Embedder | null = null;

export function getEmbedder(): Embedder {
  if (!cached) {
    if (shouldMock("embeddings")) {
      cached = new MockEmbedder();
    } else {
      const { VoyageEmbedder } = require("./voyage") as typeof import("./voyage");
      cached = new VoyageEmbedder();
    }
  }
  return cached;
}
