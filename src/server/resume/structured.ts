import { ProfileStructuredSchema, type ProfileStructured } from "@/lib/domain";
import { fixtures } from "@/server/fixtures";

/** Turn raw résumé text into a structured profile draft. */
export interface StructuredExtractor {
  extract(rawText: string): Promise<ProfileStructured>;
}

const ROLE_RE = /engineer|designer|manager|developer|scientist|lead|architect|analyst/i;

/**
 * Mock extractor: pulls the candidate's name and headline heuristically from the
 * résumé text, and drafts the rest from the demo profile for the user to edit.
 * Real LLM-backed extraction is wired in Phase 20.
 */
export class MockStructuredExtractor implements StructuredExtractor {
  async extract(rawText: string): Promise<ProfileStructured> {
    const base = ProfileStructuredSchema.parse(fixtures.profiles[0].structured);
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const name = lines[0] && lines[0].length <= 60 ? lines[0] : base.name;
    const headline = lines.find((l) => ROLE_RE.test(l)) ?? base.headline;

    return { ...base, name, headline };
  }
}

let cached: StructuredExtractor | null = null;

export function getStructuredExtractor(): StructuredExtractor {
  if (!cached) cached = new MockStructuredExtractor();
  return cached;
}
