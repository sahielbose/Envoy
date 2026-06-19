import {
  ProfileStructuredSchema,
  type Dossier,
  type OutreachDraft,
} from "@/lib/domain";
import { fixtures } from "@/server/fixtures";
import type { ServiceDeps } from "./deps";
import type { EnvoyServices } from "./types";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

function summarize(headline: string, years: number | undefined, skills: string[]): string {
  const yrs = years ? ` with ${years} years of experience` : "";
  const top = skills.slice(0, 3).join(", ");
  return `${headline}${yrs}${top ? `; strongest in ${top}.` : "."}`;
}

/**
 * Deterministic mock services backed by fixtures + the repository layer. They
 * conform to the tool contracts. Guardrails are structural: tailor_resume and
 * draft_outreach only build and return content — there is no send/submit path
 * anywhere in this module.
 */
export function createMockServices(deps: ServiceDeps): EnvoyServices {
  const { repositories } = deps;

  return {
    async parseResume({ fileId }) {
      const stored = await deps.storage.get(fileId);
      if (!stored) {
        // Mock convenience: fall back to the demo profile if the file is absent.
        const fixture = fixtures.profiles[0];
        const structured = ProfileStructuredSchema.parse(fixture.structured);
        return { rawText: fixture.rawResumeText ?? "", structured };
      }
      const rawText = await deps.extractor.extract({
        bytes: stored.bytes,
        contentType: stored.meta.contentType,
        filename: stored.meta.filename,
      });
      const structured = await deps.structured.extract(rawText);
      return { rawText, structured };
    },

    async buildProfile({ userId, structured, preferences }) {
      const summary = summarize(structured.headline, structured.yearsExperience, structured.skills);
      const profile = await repositories.profiles.upsert({
        userId,
        structured,
        preferences,
        summary,
      });
      return { profileId: profile.id, summary };
    },

    async findRoles({ profileId, limit }) {
      const matches = await repositories.matches.listByProfile(profileId);
      const mapped = matches
        .filter((m) => m.status !== "dismissed")
        .map((m) => ({
          jobId: m.jobId,
          score: m.score,
          reasoning: m.reasoning,
          gaps: asStringArray(m.gaps),
        }));
      return { matches: typeof limit === "number" ? mapped.slice(0, limit) : mapped };
    },

    async tailorResume({ profileId, jobId }) {
      const profile = await repositories.profiles.findById(profileId);
      const parsed = ProfileStructuredSchema.safeParse(profile?.structured);
      const firstHighlight =
        parsed.success && parsed.data.experience[0]?.highlights[0]
          ? parsed.data.experience[0].highlights[0]
          : "Built and shipped product features end to end.";
      return {
        resumeDocId: `resume_${profileId}_${jobId}`,
        coverLetterDocId: `cover_${profileId}_${jobId}`,
        diffSummary:
          "Re-emphasized your most relevant experience for this posting. Nothing was invented — every line traces to your base résumé.",
        changes: [
          {
            section: "Summary",
            before: parsed.success ? parsed.data.headline : "Engineer",
            after: `${parsed.success ? parsed.data.headline : "Engineer"} — focused on the work this role needs most`,
            source: parsed.success ? parsed.data.headline : "headline",
          },
          {
            section: "Experience",
            before: firstHighlight,
            after: firstHighlight,
            source: firstHighlight,
          },
        ],
      };
    },

    async researchCompany({ company }) {
      const dossier: Dossier = {
        company,
        overview: `${company} is a venture-backed startup. This dossier is assembled from public web sources only.`,
        signals: [
          `${company} recently announced a new product initiative (public blog).`,
          `${company} is hiring across engineering and design (public careers page).`,
        ],
        product: `${company}'s product centers on a customer-facing platform.`,
        culture: "Small, fast-moving, remote-friendly team that values ownership.",
        people: [
          { role: "Engineering Manager", archetype: "hiring manager", focus: "frontend platform" },
          { role: "Founder / CEO", archetype: "decision maker", focus: "vision and roadmap" },
        ],
      };
      return {
        dossier,
        likelyQuestions: [
          "Walk me through a design system you've built and the trade-offs you made.",
          "How do you approach accessibility in a fast-moving product?",
          "Tell me about a time you shipped something 0→1.",
        ],
        questionsToAsk: [
          "What does the first 90 days look like for this role?",
          "How does the team balance velocity with quality?",
          "Where is the product headed over the next year?",
        ],
        sources: [{ title: `${company} — Careers`, url: `https://example.com/${encodeURIComponent(company)}/careers` }],
      };
    },

    async mapContacts() {
      // Roles/archetypes to reach + rationale only. No contact-info scraping;
      // named people would be publicly-listed only.
      return {
        targets: [
          {
            archetype: "Hiring manager (Engineering Manager)",
            rationale: "Owns the role and the hiring decision — the highest-leverage warm intro.",
          },
          {
            archetype: "Future peer (Senior Engineer on the team)",
            rationale: "Can speak to the day-to-day and refer you internally.",
          },
          {
            archetype: "Recruiter / Talent partner",
            rationale: "Can fast-track your application once you're a warm referral.",
          },
        ],
      };
    },

    async draftOutreach({ profileId, target, channel }) {
      const profile = await repositories.profiles.findById(profileId);
      const parsed = ProfileStructuredSchema.safeParse(profile?.structured);
      const headline = parsed.success ? parsed.data.headline : "an engineer";
      const skill = parsed.success ? (parsed.data.skills[0] ?? "your stack") : "your stack";
      const withSubject = channel === "email";

      const drafts: OutreachDraft[] = [
        {
          tone: "warm",
          subject: withSubject ? "Loved what your team is building" : undefined,
          body: `Hi — I came across the work your team is doing and it's exactly the kind of problem I'd jump at. I'm a ${headline} with deep ${skill} experience, and I'd love a quick chat about how I could help. Happy to share a couple of things I'd dig into first.`,
        },
        {
          tone: "direct",
          subject: withSubject ? `${headline} interested in the ${target.archetype}` : undefined,
          body: `Hi — I'm a ${headline} and I'm very interested in your open role. My background in ${skill} maps closely to what you're hiring for. Would you be open to a 15-minute call this week?`,
        },
        {
          tone: "brief",
          subject: withSubject ? "Quick intro" : undefined,
          body: `Hi — ${headline} here, strong in ${skill}. I'd love to be considered for your team. Open to a quick chat?`,
        },
      ];

      return {
        drafts,
        rationale:
          "Each variant is grounded in your real background and personalized to the role. Draft only — nothing sends until you explicitly approve a message.",
      };
    },

    async trackApplication({ userId, jobId, stage, note, nextAction }) {
      const existing = (await repositories.applications.listByUser(userId)).find(
        (a) => a.jobId === jobId,
      );
      if (existing) {
        const updated = await repositories.applications.update(existing.id, {
          stage,
          notes: note ?? undefined,
          nextAction,
        });
        return { applicationId: updated.id };
      }
      const created = await repositories.applications.create({
        userId,
        jobId,
        stage,
        notes: note,
        nextAction,
      });
      return { applicationId: created.id };
    },
  };
}
