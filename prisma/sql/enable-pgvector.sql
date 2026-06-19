-- Enable pgvector. Run this BEFORE `prisma db push`, since the Job and
-- CandidateProfile tables declare vector(1024) columns.
CREATE EXTENSION IF NOT EXISTS vector;
