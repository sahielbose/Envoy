import type { Dossier, Interviewer } from "@/lib/domain";
import type { SearchResult } from "@/lib/search";
import type { Job } from "@/server/repositories";

/** People to expect, roles/archetypes only (public data; never scraped). */
function peopleFor(job?: Job | null): Interviewer[] {
  const title = (job?.title ?? "").toLowerCase();
  const craft = /design/.test(title)
    ? "design craft and systems"
    : /manager|product|pm/.test(title)
      ? "roadmap and prioritization"
      : "engineering craft";
  return [
    { role: "Engineering Manager", archetype: "hiring manager", focus: "the team and the role" },
    { role: "Senior team member", archetype: "future peer", focus: craft },
    { role: "Founder / CEO", archetype: "decision maker", focus: "vision and roadmap" },
  ];
}

export function buildDossier(
  company: string,
  results: SearchResult[],
  job?: Job | null,
): Dossier {
  return {
    company,
    overview: `${company} is a venture-backed startup. This dossier is assembled from public web sources only.`,
    signals: results.slice(0, 3).map((r) => r.snippet),
    product: job
      ? `Hiring for ${job.title}. ${results[2]?.snippet ?? ""}`.trim()
      : (results[2]?.snippet ?? undefined),
    culture: "Small, fast-moving, remote-friendly team that values ownership.",
    people: peopleFor(job),
  };
}

export function likelyQuestions(job?: Job | null): string[] {
  const title = (job?.title ?? "").toLowerCase();
  if (/design/.test(title)) {
    return [
      "Walk me through your design process end to end.",
      "How do you collaborate with engineering on a design system?",
      "Tell me about a time research changed a decision.",
    ];
  }
  if (/manager|product|pm/.test(title)) {
    return [
      "How do you prioritize a roadmap with limited resources?",
      "Tell me about a launch you led 0 to 1.",
      "How do you balance velocity with quality?",
    ];
  }
  return [
    "Walk me through a system or component you designed and the trade-offs you made.",
    "How do you approach accessibility and performance under a deadline?",
    "Tell me about a time you shipped something 0 to 1.",
  ];
}

export function questionsToAsk(company: string): string[] {
  return [
    `What does the first 90 days look like in this role at ${company}?`,
    `How does ${company} balance shipping speed with quality?`,
    "Where is the product headed over the next year?",
    "What does success look like for this role in six months?",
  ];
}
