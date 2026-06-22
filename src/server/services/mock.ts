import { ProfileStructuredSchema, type OutreachDraft } from "@/lib/domain";
import { fixtures } from "@/server/fixtures";
import { runFindRoles } from "@/lib/matching/pipeline";
import { generateTailored, putDoc, verifyTruthful } from "@/server/resume/tailor";
import { buildDossier, likelyQuestions, questionsToAsk } from "@/server/research/dossier";
import { ResearchCompanyOutput } from "@/server/tools/contracts";
import { assertNoContactInfo } from "@/server/policy/pii";
import type { ServiceDeps } from "./deps";
import type { EnvoyServices } from "./types";

function summarize(structured: {
  headline: string;
  yearsExperience?: number;
  skills: string[];
  location?: string;
}): string {
  const yrs = structured.yearsExperience ? `${structured.yearsExperience}-year ` : "";
  const top = structured.skills.slice(0, 3).join(", ");
  const where = structured.location ? ` Open to ${structured.location}.` : "";
  return `${yrs}${structured.headline}${top ? `, strongest in ${top}` : ""}.${where}`.trim();
}

/**
 * Deterministic mock services backed by fixtures + the repository layer. They
 * conform to the tool contracts. Guardrails are structural: tailor_resume and
 * draft_outreach only build and return content, there is no send/submit path
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
      const summary = summarize(structured);
      const profile = await repositories.profiles.upsert({
        userId,
        structured,
        preferences,
        summary,
      });
      return { profileId: profile.id, summary };
    },

    async findRoles({ profileId, query, filters, limit }) {
      const matches = await runFindRoles(
        { repositories, embedder: deps.embedder, reranker: deps.reranker },
        { profileId, query, filters, limit },
      );
      return { matches };
    },

    async tailorResume({ profileId, jobId }) {
      const profile = await repositories.profiles.findById(profileId);
      const parsed = ProfileStructuredSchema.safeParse(profile?.structured);
      const structured = parsed.success
        ? parsed.data
        : ProfileStructuredSchema.parse(fixtures.profiles[0].structured);

      const job = await repositories.jobs.findById(jobId);
      const company = job?.companyId
        ? ((await repositories.companies.findById(job.companyId))?.name ?? "")
        : "";

      const result = generateTailored({
        structured,
        summary: profile?.summary ?? "",
        job: {
          title: job?.title ?? "the role",
          company,
          description: job?.description ?? "",
        },
      });

      // Truthfulness guard: drop any change that doesn't trace to the base.
      const verified = result.changes.filter((c) => verifyTruthful([c], result.baseText).ok);

      const resumeDoc = putDoc({
        kind: "resume",
        title: `Résumé, ${job?.title ?? "role"}`,
        text: result.resumeText,
      });
      const coverDoc = putDoc({
        kind: "cover",
        title: `Cover letter, ${job?.title ?? "role"}`,
        text: result.coverText,
      });

      return {
        resumeDocId: resumeDoc.id,
        coverLetterDocId: coverDoc.id,
        diffSummary: result.diffSummary,
        changes: verified,
      };
    },

    async researchCompany({ company, jobId }) {
      // Cache hit: return the dossier stored on the Company.
      const existing = await repositories.companies.findByName(company);
      if (existing?.dossier && existing.dossierAt) {
        const cached = ResearchCompanyOutput.safeParse(existing.dossier);
        if (cached.success) return cached.data;
      }

      const results = await deps.search.search(
        `${company} company news funding product culture`,
        { limit: 5 },
      );
      const job = jobId ? await repositories.jobs.findById(jobId) : null;
      const output = {
        dossier: buildDossier(company, results, job),
        likelyQuestions: likelyQuestions(job),
        questionsToAsk: questionsToAsk(company),
        sources: results.map((r) => ({ title: r.title, url: r.url })),
      };
      assertNoContactInfo(output, "research_company");

      // Cache on the Company for next time.
      await repositories.companies.upsert({
        name: company,
        dossier: output,
        dossierAt: new Date("2026-06-01T00:00:00.000Z"),
      });
      return output;
    },

    async mapContacts({ jobId }) {
      // Roles/archetypes to reach + rationale only. No contact-info scraping;
      // named people would be publicly-listed only.
      const job = await repositories.jobs.findById(jobId);
      const title = job?.title ?? "the role";
      const manager = /(engineer|developer)/i.test(title)
        ? "Engineering Manager"
        : /design/i.test(title)
          ? "Design Manager"
          : /product|pm/i.test(title)
            ? "Head of Product"
            : "the team lead";
      const result = {
        targets: [
          {
            archetype: `Hiring manager (likely the ${manager})`,
            rationale: "Owns the role and the hiring decision, the highest-leverage warm intro.",
          },
          {
            archetype: `Future peer (a senior person on the ${title} team)`,
            rationale: "Can speak to the day-to-day and refer you internally.",
          },
          {
            archetype: "Recruiter / Talent partner",
            rationale: "Can fast-track your application once you're a warm referral.",
          },
        ],
      };
      assertNoContactInfo(result, "map_contacts");
      return result;
    },

    async draftOutreach({ profileId, jobId, target, channel }) {
      const profile = await repositories.profiles.findById(profileId);
      const parsed = ProfileStructuredSchema.safeParse(profile?.structured);
      const headline = parsed.success ? parsed.data.headline : "an engineer";
      const skill = parsed.success ? (parsed.data.skills[0] ?? "your stack") : "your stack";
      const withSubject = channel === "email";

      const drafts: OutreachDraft[] = [
        {
          tone: "warm",
          subject: withSubject ? "Loved what your team is building" : undefined,
          body: `Hi, I came across the work your team is doing and it's exactly the kind of problem I'd jump at. I'm a ${headline} with deep ${skill} experience, and I'd love a quick chat about how I could help. Happy to share a couple of things I'd dig into first.`,
        },
        {
          tone: "direct",
          subject: withSubject ? `${headline} interested in the ${target.archetype}` : undefined,
          body: `Hi, I'm a ${headline} and I'm very interested in your open role. My background in ${skill} maps closely to what you're hiring for. Would you be open to a 15-minute call this week?`,
        },
        {
          tone: "brief",
          subject: withSubject ? "Quick intro" : undefined,
          body: `Hi, ${headline} here, strong in ${skill}. I'd love to be considered for your team. Open to a quick chat?`,
        },
      ];

      // Persist as a draft for the outreach queue. DRAFT ONLY, this records
      // content for the user to review; it never transmits anything.
      const userId = profile?.userId;
      if (userId) {
        const existing = (await repositories.outreach.listByUser(userId)).find(
          (o) => o.jobId === jobId && o.status === "draft",
        );
        if (existing) {
          await repositories.outreach.update(existing.id, { drafts });
        } else {
          await repositories.outreach.create({
            userId,
            jobId,
            target,
            channel,
            drafts,
            status: "draft",
          });
        }
      }

      return {
        drafts,
        rationale:
          "Each variant is grounded in your real background and personalized to the role. Draft only, nothing sends until you explicitly approve a message.",
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
