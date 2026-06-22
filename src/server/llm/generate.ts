import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { ProfileStructured, OutreachDraft, Dossier } from "@/lib/domain";
import type { SearchResult } from "@/lib/search";
import { assertNoContactInfo } from "@/server/policy/pii";

const model = () =>
  createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(
    process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
  );

/** Drop em-dashes/en-dashes to match the rest of the site's copy. */
export function sanitizeProse(text: string): string {
  return text
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, "-")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/**
 * Truthfulness guard for generated prose: flag any *metric* (a $ amount, a
 * magnitude like 2M/40k, a percentage, or an Nx multiplier) that does not
 * appear in the candidate's real profile text. Plain numbers ("20 minutes",
 * "6 years") are not metrics and are left alone. A non-empty result means the
 * model invented a figure, so the caller falls back to the deterministic path.
 */
export function ungroundedMetrics(text: string, baseText: string): string[] {
  const norm = (s: string) => s.toLowerCase().replace(/[\s,$]/g, "");
  const base = norm(baseText);
  const metrics =
    text.match(
      /\$\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\s?(?:k|m|b|million|billion|thousand)\b|\d+(?:\.\d+)?\s?%|\b\d+(?:\.\d+)?x\b/gi,
    ) ?? [];
  return metrics.filter((m) => !base.includes(norm(m)));
}

function baseTextOf(structured: ProfileStructured, summary: string): string {
  const exp = structured.experience
    .map((e) => `${e.title} ${e.company} ${e.start} ${e.end} ${e.highlights.join(" ")}`)
    .join(" ");
  return [structured.name, structured.headline, summary, structured.skills.join(" "), exp].join(" ");
}

const TRUTH_RULES =
  "Hard rules: use ONLY facts present in the candidate JSON. Never invent employers, titles, " +
  "dates, degrees, skills, or metrics. Do not state any number, percentage, or dollar figure that " +
  "is not already in the candidate's data. Write in plain, warm, active voice, sentence case. Do " +
  "not use em-dashes.";

export interface TailorInput {
  structured: ProfileStructured;
  summary: string;
  job: { title: string; company: string; description: string };
  baseText: string;
}

/** Claude-tailored summary + cover letter, or null if a call/guard fails. */
export async function llmTailor(input: TailorInput): Promise<{ summary: string; coverText: string } | null> {
  try {
    const { object } = await generateObject({
      model: model(),
      schema: z.object({
        summary: z.string().describe("A 1-2 sentence résumé summary tailored to the posting."),
        coverLetter: z.string().describe("A short cover letter, 3 short paragraphs, no salutation line repeated."),
      }),
      system: `You tailor a résumé summary and cover letter to a specific job. ${TRUTH_RULES}`,
      prompt:
        `Candidate (JSON): ${JSON.stringify(input.structured)}\n` +
        `Current summary: ${input.summary}\n` +
        `Job: ${input.job.title} at ${input.job.company || "the company"}\n` +
        `Job description: ${input.job.description}\n\n` +
        "Write a tailored summary and a cover letter that lead with the candidate's most relevant " +
        "real experience for this role. The cover letter should open with a concrete achievement, " +
        "name the real skill overlap, and close with a specific ask. Address it to the company team.",
    });
    const summary = sanitizeProse(object.summary);
    const cover = sanitizeProse(object.coverLetter);
    if (ungroundedMetrics(`${summary}\n${cover}`, input.baseText).length > 0) return null;
    return { summary, coverText: cover };
  } catch {
    return null;
  }
}

export interface OutreachInput {
  structured: ProfileStructured;
  summary: string;
  job: { title: string; company: string };
  target: { archetype: string; rationale: string };
  channel: string;
}

/** Claude-written outreach drafts (warm/direct/brief), or null on failure/guard. */
export async function llmOutreach(input: OutreachInput): Promise<OutreachDraft[] | null> {
  try {
    const { object } = await generateObject({
      model: model(),
      schema: z.object({
        drafts: z
          .array(
            z.object({
              tone: z.enum(["warm", "direct", "brief"]),
              subject: z.string().optional(),
              body: z.string(),
            }),
          )
          .length(3),
      }),
      system: `You draft short, personal outreach a candidate can send after they approve it. ${TRUTH_RULES} Never include phone numbers or email addresses.`,
      prompt:
        `Candidate (JSON): ${JSON.stringify(input.structured)}\n` +
        `Reaching out to: ${input.target.archetype} (${input.target.rationale})\n` +
        `Role: ${input.job.title} at ${input.job.company || "the company"}\n` +
        `Channel: ${input.channel}\n\n` +
        "Write exactly three variants with tones warm, direct, and brief. Ground every claim in the " +
        "candidate's real background. " +
        (input.channel === "email" ? "Include a short subject line for each." : "Omit the subject."),
    });
    const base = baseTextOf(input.structured, input.summary);
    const drafts: OutreachDraft[] = object.drafts.map((d) => ({
      tone: d.tone,
      subject: input.channel === "email" ? (d.subject ? sanitizeProse(d.subject) : undefined) : undefined,
      body: sanitizeProse(d.body),
    }));
    const allText = drafts.map((d) => `${d.subject ?? ""} ${d.body}`).join("\n");
    if (ungroundedMetrics(allText, base).length > 0) return null;
    assertNoContactInfo(drafts, "draft_outreach"); // throws if a contact slipped in
    return drafts;
  } catch {
    return null;
  }
}

export interface DossierInput {
  company: string;
  job: { title: string; description: string } | null;
  results: SearchResult[];
}

/** Claude-written company dossier grounded in public search snippets, or null. */
export async function llmDossier(
  input: DossierInput,
): Promise<{ dossier: Dossier; likelyQuestions: string[]; questionsToAsk: string[] } | null> {
  try {
    const snippets = input.results
      .map((r, i) => `[${i + 1}] ${r.title} — ${r.url}\n${r.snippet ?? ""}`)
      .join("\n\n");
    const { object } = await generateObject({
      model: model(),
      schema: z.object({
        overview: z.string(),
        signals: z.array(z.string()),
        product: z.string().optional(),
        culture: z.string().optional(),
        likelyQuestions: z.array(z.string()),
        questionsToAsk: z.array(z.string()),
      }),
      system:
        "You build an interview-prep dossier for a candidate from PUBLIC web snippets only. Use only " +
        "what's in the snippets; do not invent facts. Never include anyone's private contact info " +
        "(no emails, phone numbers, or home addresses). Plain voice, no em-dashes.",
      prompt:
        `Company: ${input.company}\n` +
        (input.job ? `Role: ${input.job.title}\nDescription: ${input.job.description}\n` : "") +
        `\nPublic snippets:\n${snippets}\n\n` +
        "Write a concise overview, 3-5 signals (funding, product, momentum), optional product and " +
        "culture notes, likely interview questions for this role, and smart questions the candidate " +
        "should ask.",
    });
    const dossier: Dossier = {
      company: input.company,
      overview: sanitizeProse(object.overview),
      signals: object.signals.map(sanitizeProse),
      product: object.product ? sanitizeProse(object.product) : undefined,
      culture: object.culture ? sanitizeProse(object.culture) : undefined,
      people: [],
    };
    const out = {
      dossier,
      likelyQuestions: object.likelyQuestions.map(sanitizeProse),
      questionsToAsk: object.questionsToAsk.map(sanitizeProse),
    };
    assertNoContactInfo(out, "research_company"); // throws if a contact slipped in
    return out;
  } catch {
    return null;
  }
}
