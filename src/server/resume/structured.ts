import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { ProfileStructuredSchema, type ProfileStructured } from "@/lib/domain";
import { fixtures } from "@/server/fixtures";
import { shouldMock } from "@/lib/env";

/** Turn raw résumé text into a structured profile draft. */
export interface StructuredExtractor {
  extract(rawText: string): Promise<ProfileStructured>;
}

const ROLE_RE = /engineer|designer|manager|developer|scientist|lead|architect|analyst/i;

/**
 * Mock extractor: pulls the candidate's name and headline heuristically from the
 * résumé text, and drafts the rest from the demo profile for the user to edit.
 * The real Anthropic extractor structures the whole résumé.
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

/**
 * Real extractor (Anthropic). Structures the résumé into the profile schema,
 * grounded only in the text — no invented employers, dates, or skills (a hard
 * guardrail). Falls back to the heuristic draft if the model call fails.
 */
export class AnthropicStructuredExtractor implements StructuredExtractor {
  async extract(rawText: string): Promise<ProfileStructured> {
    try {
      const model = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(
        process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
      );
      const { object } = await generateObject({
        model,
        schema: ProfileStructuredSchema,
        prompt:
          "Extract a structured candidate profile from this résumé. Use ONLY information present " +
          "in the text — never invent employers, titles, dates, degrees, or skills. If a field is " +
          "absent, omit it or leave it empty. Keep highlights as the candidate wrote them.\n\n" +
          `Résumé:\n${rawText}`,
      });
      return ProfileStructuredSchema.parse(object);
    } catch {
      return new MockStructuredExtractor().extract(rawText);
    }
  }
}

let cached: { mock: boolean; impl: StructuredExtractor } | null = null;

export function getStructuredExtractor(): StructuredExtractor {
  const mock = shouldMock("llm");
  if (!cached || cached.mock !== mock) {
    cached = { mock, impl: mock ? new MockStructuredExtractor() : new AnthropicStructuredExtractor() };
  }
  return cached.impl;
}
