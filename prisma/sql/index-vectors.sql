-- Index the embedding columns for cosine similarity search.
-- Run this AFTER `prisma db push` has created the tables.
CREATE INDEX IF NOT EXISTS job_embedding_idx
  ON "Job" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS candidate_profile_embedding_idx
  ON "CandidateProfile" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
