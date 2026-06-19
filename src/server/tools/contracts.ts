import { z } from "zod";
import {
  ApplicationStageSchema,
  ContactTargetSchema,
  DossierSchema,
  JobFilterSchema,
  MatchResultSchema,
  NextActionSchema,
  OutreachChannelSchema,
  OutreachDraftSchema,
  PreferencesSchema,
  ProfileStructuredSchema,
  ResumeChangeSchema,
  SourceRefSchema,
} from "@/lib/domain";

/* --------------------------------------------------------- parse_resume */
export const ParseResumeInput = z.object({ fileId: z.string() });
export const ParseResumeOutput = z.object({
  rawText: z.string(),
  structured: ProfileStructuredSchema,
});

/* -------------------------------------------------------- build_profile */
export const BuildProfileInput = z.object({
  userId: z.string(),
  structured: ProfileStructuredSchema,
  preferences: PreferencesSchema,
});
export const BuildProfileOutput = z.object({
  profileId: z.string(),
  summary: z.string(),
});

/* ----------------------------------------------------------- find_roles */
export const FindRolesInput = z.object({
  profileId: z.string(),
  query: z.string().optional(),
  filters: JobFilterSchema.optional(),
  limit: z.number().int().positive().max(50).optional(),
});
export const FindRolesOutput = z.object({
  matches: z.array(MatchResultSchema),
});

/* -------------------------------------------------------- tailor_resume */
export const TailorResumeInput = z.object({
  profileId: z.string(),
  jobId: z.string(),
});
export const TailorResumeOutput = z.object({
  resumeDocId: z.string(),
  coverLetterDocId: z.string(),
  diffSummary: z.string(),
  changes: z.array(ResumeChangeSchema),
});

/* ----------------------------------------------------- research_company */
export const ResearchCompanyInput = z.object({
  company: z.string(),
  jobId: z.string().optional(),
  people: z.array(z.string()).optional(),
});
export const ResearchCompanyOutput = z.object({
  dossier: DossierSchema,
  likelyQuestions: z.array(z.string()),
  questionsToAsk: z.array(z.string()),
  sources: z.array(SourceRefSchema),
});

/* -------------------------------------------------------- map_contacts */
export const MapContactsInput = z.object({
  profileId: z.string(),
  jobId: z.string(),
});
export const MapContactsOutput = z.object({
  targets: z.array(ContactTargetSchema),
});

/* ------------------------------------------------------ draft_outreach */
export const DraftOutreachInput = z.object({
  profileId: z.string(),
  jobId: z.string(),
  target: ContactTargetSchema,
  channel: OutreachChannelSchema,
});
export const DraftOutreachOutput = z.object({
  drafts: z.array(OutreachDraftSchema),
  rationale: z.string(),
});

/* --------------------------------------------------- track_application */
export const TrackApplicationInput = z.object({
  userId: z.string(),
  jobId: z.string(),
  stage: ApplicationStageSchema,
  note: z.string().optional(),
  nextAction: NextActionSchema.optional(),
});
export const TrackApplicationOutput = z.object({
  applicationId: z.string(),
});

/**
 * The tool contract registry the agent exposes. Descriptions double as the
 * model-facing tool docs and encode the hard guardrails.
 */
export const TOOL_CONTRACTS = {
  parse_resume: {
    description: "Extract raw text and a structured profile from an uploaded résumé file.",
    input: ParseResumeInput,
    output: ParseResumeOutput,
  },
  build_profile: {
    description: "Build a candidate profile + plain-English summary from structured data and preferences.",
    input: BuildProfileInput,
    output: BuildProfileOutput,
  },
  find_roles: {
    description:
      "Rank ingested, ToS-compliant roles against a profile and return matches with reasoning and gaps.",
    input: FindRolesInput,
    output: FindRolesOutput,
  },
  tailor_resume: {
    description:
      "Reword a base résumé + cover letter for a posting. Truthful only — every change traces to the base. Returns content; never submits.",
    input: TailorResumeInput,
    output: TailorResumeOutput,
  },
  research_company: {
    description:
      "Build a company/interviewer dossier from public web data only. Never returns harvested private contact info.",
    input: ResearchCompanyInput,
    output: ResearchCompanyOutput,
  },
  map_contacts: {
    description:
      "Identify the right roles/archetypes to reach (and publicly-listed names only) with rationale. No contact-info scraping.",
    input: MapContactsInput,
    output: MapContactsOutput,
  },
  draft_outreach: {
    description:
      "Draft warm, personal outreach in tone variants. DRAFT ONLY — returns content, never transmits. Sending is a separate, approval-gated user action.",
    input: DraftOutreachInput,
    output: DraftOutreachOutput,
  },
  track_application: {
    description: "Record or advance an application's stage with an optional note and next action.",
    input: TrackApplicationInput,
    output: TrackApplicationOutput,
  },
} as const;

export type ToolName = keyof typeof TOOL_CONTRACTS;

export type ToolInput<T extends ToolName> = z.infer<(typeof TOOL_CONTRACTS)[T]["input"]>;
export type ToolOutput<T extends ToolName> = z.infer<(typeof TOOL_CONTRACTS)[T]["output"]>;
