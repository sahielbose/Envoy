import type { Job } from "@/server/repositories";
import type { Preferences, ProfileStructured } from "@/lib/domain";

export interface RerankCandidate {
  job: Job;
  companyName?: string;
  similarity: number;
}

export interface RerankInput {
  structured: ProfileStructured;
  preferences: Preferences;
  candidates: RerankCandidate[];
}

export interface RerankedMatch {
  jobId: string;
  score: number; // 0..1
  reasoning: string;
  gaps: string[];
}

/** Reranks retrieved candidates for fit + reasoning. Mock now; Claude in Phase 20. */
export interface Reranker {
  rerank(input: RerankInput): Promise<RerankedMatch[]>;
}

const COMMON_SKILLS = [
  "go",
  "golang",
  "rust",
  "python",
  "java",
  "kubernetes",
  "docker",
  "aws",
  "node",
  "postgres",
  "graphql",
  "figma",
  "fintech",
  "design systems",
  "react",
  "typescript",
  "accessibility",
  "machine learning",
  "data",
];

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

export class MockReranker implements Reranker {
  async rerank(input: RerankInput): Promise<RerankedMatch[]> {
    const sims = input.candidates.map((c) => c.similarity);
    const min = Math.min(...sims, 0);
    const max = Math.max(...sims, 0);
    const span = max - min;

    const profileSkills = input.structured.skills.map((s) => s.toLowerCase());

    const ranked = input.candidates.map((candidate) => {
      const { job } = candidate;
      const jobText = `${job.title} ${job.location ?? ""} ${job.description}`.toLowerCase();

      const normalizedSim = span > 0 ? (candidate.similarity - min) / span : 0.5;
      const overlap = profileSkills.filter((s) => jobText.includes(s));
      // 4+ overlapping skills reads as a full skill match.
      const skillScore = Math.min(1, overlap.length / 4);

      const titles = [input.structured.headline, ...input.preferences.titles].map((t) =>
        t.toLowerCase(),
      );
      const titleMatch = titles.some((t) => t && job.title.toLowerCase().includes(t)) ? 1 : 0;

      // Surfaced roles sit in a realistic 45-100 band; strong fits reach the 90s.
      const score = round2(
        clamp01(0.45 + 0.3 * skillScore + 0.15 * titleMatch + 0.1 * normalizedSim),
      );

      // reasoning
      const topOverlap = overlap.slice(0, 2).join(" and ");
      const where = candidate.companyName ?? "this team";
      const parts: string[] = [];
      if (topOverlap) {
        parts.push(`Your ${topOverlap} experience maps directly onto ${where}'s ${job.title} role.`);
      } else {
        parts.push(`${where}'s ${job.title} is adjacent to your background.`);
      }
      if (titleMatch) parts.push("The title lines up with what you're targeting.");
      if (job.remote && input.preferences.remote) {
        parts.push("It's remote-friendly, which matches your preference.");
      }
      const reasoning = parts.join(" ");

      // gaps
      const gaps: string[] = [];
      for (const skill of COMMON_SKILLS) {
        if (jobText.includes(skill) && !profileSkills.includes(skill)) {
          gaps.push(`Role emphasizes ${skill}, which isn't on your profile yet.`);
        }
        if (gaps.length >= 2) break;
      }
      if (!job.remote && input.preferences.remote) {
        gaps.push("On-site/hybrid vs. your remote preference.");
      }

      return { jobId: job.id, score, reasoning, gaps };
    });

    return ranked.sort((a, b) => b.score - a.score);
  }
}

let cached: Reranker | null = null;

export function getReranker(): Reranker {
  if (!cached) cached = new MockReranker();
  return cached;
}
