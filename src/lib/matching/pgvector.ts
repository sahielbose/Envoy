import { Prisma, type PrismaClient } from "@prisma/client";
import type { SimilarityHit } from "./vector-store";

/** Format a JS vector as a pgvector literal, e.g. [0.1,0.2,...]. */
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}

/** Persist a job's embedding into the pgvector column. */
export async function setJobEmbedding(
  prisma: PrismaClient,
  jobId: string,
  vector: number[],
): Promise<void> {
  await prisma.$executeRaw`UPDATE "Job" SET embedding = ${toVectorLiteral(vector)}::vector WHERE id = ${jobId}`;
}

/** Persist a profile's embedding into the pgvector column. */
export async function setProfileEmbedding(
  prisma: PrismaClient,
  profileId: string,
  vector: number[],
): Promise<void> {
  await prisma.$executeRaw`UPDATE "CandidateProfile" SET embedding = ${toVectorLiteral(vector)}::vector WHERE id = ${profileId}`;
}

/**
 * Cosine-similarity retrieve over the Job embeddings (pgvector). Returns hits
 * ordered by similarity (1 − cosine distance), optionally restricted to a
 * candidate id set (hard-filtered upstream).
 */
export async function queryJobsByEmbedding(
  prisma: PrismaClient,
  vector: number[],
  k: number,
  jobIds?: string[],
): Promise<SimilarityHit[]> {
  const lit = toVectorLiteral(vector);
  const rows =
    jobIds && jobIds.length > 0
      ? await prisma.$queryRaw<{ id: string; distance: number }[]>`
          SELECT id, embedding <=> ${lit}::vector AS distance
          FROM "Job"
          WHERE embedding IS NOT NULL AND id IN (${Prisma.join(jobIds)})
          ORDER BY distance ASC
          LIMIT ${k}`
      : await prisma.$queryRaw<{ id: string; distance: number }[]>`
          SELECT id, embedding <=> ${lit}::vector AS distance
          FROM "Job"
          WHERE embedding IS NOT NULL
          ORDER BY distance ASC
          LIMIT ${k}`;
  return rows.map((r) => ({ id: r.id, score: 1 - Number(r.distance) }));
}
