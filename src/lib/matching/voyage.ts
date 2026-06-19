import { env, requireProvider } from "@/lib/env";
import type { Embedder } from "./embeddings";

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MODEL = process.env.VOYAGE_MODEL ?? "voyage-3";

/** Real embeddings — Voyage AI (1024-d). */
export class VoyageEmbedder implements Embedder {
  readonly dim = 1024;

  constructor() {
    requireProvider("embeddings");
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const res = await fetch(VOYAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({ input: texts, model: MODEL, input_type: "document" }),
    });
    if (!res.ok) throw new Error(`Voyage embeddings failed: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as { data: { embedding: number[] }[] };
    return data.data.map((d) => d.embedding);
  }
}
