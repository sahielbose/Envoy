import type { ProfileStructured, ResumeChange } from "@/lib/domain";

export interface TailoredDoc {
  id: string;
  kind: "resume" | "cover";
  title: string;
  text: string;
}

/** In-memory tailored-doc store (mock). Phase 20 backs it with object storage. */
const docs = new Map<string, TailoredDoc>();
let seq = 0;

export function putDoc(doc: Omit<TailoredDoc, "id">): TailoredDoc {
  seq += 1;
  const id = `${doc.kind}_${seq.toString().padStart(4, "0")}`;
  const full: TailoredDoc = { ...doc, id };
  docs.set(id, full);
  return full;
}

export function getDoc(id: string): TailoredDoc | null {
  return docs.get(id) ?? null;
}

export interface JobContext {
  title: string;
  company: string;
  description: string;
}

export interface TruthCheck {
  ok: boolean;
  violations: ResumeChange[];
}

/**
 * Truthfulness guard: every change must trace to a real span in the base
 * résumé/profile. A change whose `source` is not a (whitespace-normalized)
 * substring of the base is a fabrication and is rejected.
 */
export function verifyTruthful(changes: ResumeChange[], baseText: string): TruthCheck {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const base = norm(baseText);
  const violations = changes.filter((c) => c.source.trim() !== "" && !base.includes(norm(c.source)));
  return { ok: violations.length === 0, violations };
}

export interface TailorResult {
  resumeText: string;
  coverText: string;
  diffSummary: string;
  changes: ResumeChange[];
  /** A serialization of the base used by the truthfulness guard. */
  baseText: string;
}

function serializeBase(structured: ProfileStructured, summary: string): string {
  const exp = structured.experience
    .map((e) => `${e.title} ${e.company} ${e.start} ${e.end} ${e.highlights.join(" ")}`)
    .join(" ");
  const edu = structured.education.map((e) => `${e.degree} ${e.school} ${e.year ?? ""}`).join(" ");
  return [structured.name, structured.headline, structured.location ?? "", summary, structured.skills.join(" "), exp, edu]
    .filter(Boolean)
    .join(" ");
}

/**
 * Build a tailored résumé + cover letter for a posting. Truthful by
 * construction: every line is assembled from the candidate's own structured
 * profile, only reordered and reframed. Job title/company come from the real
 * posting. Each change carries a base span as its source for the guard.
 */
export function generateTailored(input: {
  structured: ProfileStructured;
  summary: string;
  job: JobContext;
}): TailorResult {
  const { structured, summary, job } = input;
  const jobText = `${job.title} ${job.description}`.toLowerCase();

  // Reorder real skills to surface the ones this posting emphasizes.
  const relevant = structured.skills.filter((s) => jobText.includes(s.toLowerCase()));
  const rest = structured.skills.filter((s) => !relevant.includes(s));
  const reordered = [...relevant, ...rest];

  const baseSummary = summary || structured.headline;
  const tailoredSummary = `${structured.headline} focused on the ${job.title} role at ${job.company}. ${baseSummary}`;

  const resumeText = [
    structured.name,
    `${structured.headline}${structured.location ? ` · ${structured.location}` : ""}`,
    "",
    tailoredSummary,
    "",
    "SKILLS",
    reordered.join(" · "),
    "",
    "EXPERIENCE",
    ...structured.experience.flatMap((e) => [
      `${e.title} · ${e.company} (${e.start}–${e.end})`,
      ...e.highlights.map((h) => `  - ${h}`),
    ]),
    structured.education.length > 0 ? "" : "",
    structured.education.length > 0 ? "EDUCATION" : "",
    ...structured.education.map((e) => `${e.degree}, ${e.school}${e.year ? ` (${e.year})` : ""}`),
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  const topHighlight = structured.experience[0]?.highlights[0] ?? "";
  const coverText = [
    `Dear ${job.company} team,`,
    "",
    `I'm excited to apply for the ${job.title} role. I'm a ${structured.headline}${
      structured.yearsExperience ? ` with ${structured.yearsExperience} years of experience` : ""
    }, and my background lines up closely with what you're looking for.`,
    topHighlight ? `Most recently, ${topHighlight.charAt(0).toLowerCase()}${topHighlight.slice(1)}` : "",
    `My strengths in ${reordered.slice(0, 3).join(", ")} map directly onto this role. I'd welcome the chance to talk.`,
    "",
    "Best,",
    structured.name,
  ]
    .filter(Boolean)
    .join("\n\n");

  const changes: ResumeChange[] = [
    {
      section: "Summary",
      before: baseSummary,
      after: tailoredSummary,
      source: baseSummary,
    },
    {
      section: "Skills",
      before: structured.skills.join(" · "),
      after: reordered.join(" · "),
      // Source uses the base serialization's separator so it traces cleanly.
      source: structured.skills.join(" "),
    },
  ];
  if (topHighlight) {
    changes.push({
      section: "Experience",
      before: topHighlight,
      after: topHighlight,
      source: topHighlight,
    });
  }

  const diffSummary = `Reordered your skills to surface ${
    relevant.slice(0, 2).join(" and ") || "the most relevant ones"
  }, reframed your summary for the ${job.title} role, and drafted a matching cover letter. Only your real experience — nothing invented.`;

  return {
    resumeText,
    coverText,
    diffSummary,
    changes,
    baseText: serializeBase(structured, summary),
  };
}
