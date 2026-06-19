import { z } from "zod";

/* ------------------------------------------------------------------ profile */

export const ExperienceItemSchema = z.object({
  company: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  highlights: z.array(z.string()).default([]),
});
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

export const EducationItemSchema = z.object({
  school: z.string(),
  degree: z.string(),
  year: z.string().optional(),
});
export type EducationItem = z.infer<typeof EducationItemSchema>;

export const ProfileStructuredSchema = z.object({
  name: z.string(),
  headline: z.string(),
  location: z.string().optional(),
  yearsExperience: z.number().nonnegative().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
});
export type ProfileStructured = z.infer<typeof ProfileStructuredSchema>;

export const SenioritySchema = z.enum([
  "intern",
  "junior",
  "mid",
  "senior",
  "staff",
  "lead",
  "principal",
  "director",
  "exec",
]);
export type Seniority = z.infer<typeof SenioritySchema>;

export const PreferencesSchema = z.object({
  titles: z.array(z.string()).default([]),
  seniority: SenioritySchema.optional(),
  locations: z.array(z.string()).default([]),
  remote: z.boolean().default(false),
  minComp: z.number().optional(),
  workAuth: z.string().optional(),
  stages: z.array(z.string()).default([]),
  mustHaves: z.array(z.string()).default([]),
  dealbreakers: z.array(z.string()).default([]),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

/* --------------------------------------------------------------------- jobs */

export const JobFilterSchema = z.object({
  remote: z.boolean().optional(),
  source: z.string().optional(),
  companyId: z.string().optional(),
});
export type JobFilterInput = z.infer<typeof JobFilterSchema>;

export const JobSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  remote: z.boolean(),
  url: z.string().url(),
});
export type JobSummary = z.infer<typeof JobSummarySchema>;

/* ------------------------------------------------------------------ matches */

export const MatchResultSchema = z.object({
  jobId: z.string(),
  score: z.number().min(0).max(1),
  reasoning: z.string(),
  gaps: z.array(z.string()).default([]),
});
export type MatchResult = z.infer<typeof MatchResultSchema>;

/* ----------------------------------------------------------------- research */

export const InterviewerSchema = z.object({
  name: z.string().optional(),
  role: z.string(),
  archetype: z.string().optional(),
  focus: z.string().optional(),
});
export type Interviewer = z.infer<typeof InterviewerSchema>;

export const DossierSchema = z.object({
  company: z.string(),
  overview: z.string(),
  signals: z.array(z.string()).default([]),
  product: z.string().optional(),
  culture: z.string().optional(),
  people: z.array(InterviewerSchema).default([]),
});
export type Dossier = z.infer<typeof DossierSchema>;

export const SourceRefSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});
export type SourceRef = z.infer<typeof SourceRefSchema>;

/* ----------------------------------------------------------------- outreach */

export const OutreachToneSchema = z.enum(["warm", "direct", "brief"]);
export type OutreachTone = z.infer<typeof OutreachToneSchema>;

export const OutreachChannelSchema = z.enum(["email", "linkedin", "other"]);
export type OutreachChannel = z.infer<typeof OutreachChannelSchema>;

export const OutreachDraftSchema = z.object({
  tone: OutreachToneSchema,
  subject: z.string().optional(),
  body: z.string(),
});
export type OutreachDraft = z.infer<typeof OutreachDraftSchema>;

export const ContactTargetSchema = z.object({
  archetype: z.string(),
  rationale: z.string(),
  namedPerson: z.string().optional(),
});
export type ContactTarget = z.infer<typeof ContactTargetSchema>;

/* -------------------------------------------------------------- application */

export const ApplicationStageSchema = z.enum([
  "saved",
  "researching",
  "outreach_sent",
  "applied",
  "interviewing",
  "offer",
  "closed",
]);
export type ApplicationStage = z.infer<typeof ApplicationStageSchema>;

export const NextActionSchema = z.object({
  label: z.string(),
  due: z.string().optional(),
});
export type NextAction = z.infer<typeof NextActionSchema>;

/* --------------------------------------------------------------- résumé doc */

export const ResumeChangeSchema = z.object({
  section: z.string(),
  before: z.string(),
  after: z.string(),
  /** Every change must trace to a real source span in the base résumé/profile. */
  source: z.string(),
});
export type ResumeChange = z.infer<typeof ResumeChangeSchema>;
