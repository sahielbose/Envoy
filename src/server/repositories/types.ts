import type {
  Prisma,
  User,
  CandidateProfile,
  Company,
  Job,
  Match,
  Application,
  Outreach,
  Settings,
} from "@prisma/client";

export type {
  User,
  CandidateProfile,
  Company,
  Job,
  Match,
  Application,
  Outreach,
  Settings,
};

/** Filter for listing jobs (hard preference filters applied before ranking). */
export interface JobFilter {
  remote?: boolean;
  companyId?: string;
  source?: string;
}

export interface ProfileUpsert {
  userId: string;
  linkedinUrl?: string | null;
  baseResumeId?: string | null;
  rawResumeText?: string | null;
  structured: Prisma.InputJsonValue;
  preferences: Prisma.InputJsonValue;
  summary?: string | null;
}

export interface CompanyUpsert {
  name: string;
  domain?: string | null;
  dossier?: Prisma.InputJsonValue;
  dossierAt?: Date | null;
}

export interface JobUpsert {
  source: string;
  sourceJobId: string;
  companyId?: string | null;
  title: string;
  location?: string | null;
  remote?: boolean;
  description: string;
  url: string;
  postedAt?: Date | null;
}

export interface MatchUpsert {
  profileId: string;
  jobId: string;
  score: number;
  reasoning: string;
  gaps: Prisma.InputJsonValue;
  status?: string;
}

export interface ApplicationCreate {
  userId: string;
  jobId: string;
  stage?: string;
  notes?: string | null;
  nextAction?: Prisma.InputJsonValue;
  resumeFileId?: string | null;
}

export interface ApplicationPatch {
  stage?: string;
  notes?: string | null;
  nextAction?: Prisma.InputJsonValue;
  resumeFileId?: string | null;
}

export interface OutreachCreate {
  userId: string;
  jobId: string;
  target: Prisma.InputJsonValue;
  channel: string;
  drafts: Prisma.InputJsonValue;
  status?: string;
}

export interface OutreachPatch {
  status?: string;
  drafts?: Prisma.InputJsonValue;
  sentVia?: string | null;
  sentAt?: Date | null;
}

export interface SettingsUpsert {
  userId: string;
  notifyEmail?: boolean;
  cronMatchWeekly?: boolean;
  cronFollowups?: boolean;
  gmailConnected?: boolean;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export interface ProfileRepository {
  findById(id: string): Promise<CandidateProfile | null>;
  findByUserId(userId: string): Promise<CandidateProfile | null>;
  list(): Promise<CandidateProfile[]>;
  upsert(input: ProfileUpsert): Promise<CandidateProfile>;
}

export interface CompanyRepository {
  findById(id: string): Promise<Company | null>;
  findByName(name: string): Promise<Company | null>;
  list(): Promise<Company[]>;
  upsert(input: CompanyUpsert): Promise<Company>;
}

export interface JobRepository {
  findById(id: string): Promise<Job | null>;
  findByIds(ids: string[]): Promise<Job[]>;
  list(filter?: JobFilter): Promise<Job[]>;
  upsertBySource(input: JobUpsert): Promise<Job>;
  count(): Promise<number>;
}

export interface MatchRepository {
  listByProfile(profileId: string, status?: string): Promise<Match[]>;
  findByProfileAndJob(profileId: string, jobId: string): Promise<Match | null>;
  upsert(input: MatchUpsert): Promise<Match>;
  setStatus(id: string, status: string): Promise<Match>;
}

export interface ApplicationRepository {
  findById(id: string): Promise<Application | null>;
  listByUser(userId: string): Promise<Application[]>;
  create(input: ApplicationCreate): Promise<Application>;
  update(id: string, patch: ApplicationPatch): Promise<Application>;
}

export interface OutreachRepository {
  findById(id: string): Promise<Outreach | null>;
  listByUser(userId: string): Promise<Outreach[]>;
  create(input: OutreachCreate): Promise<Outreach>;
  update(id: string, patch: OutreachPatch): Promise<Outreach>;
}

export interface SettingsRepository {
  findByUserId(userId: string): Promise<Settings | null>;
  upsert(input: SettingsUpsert): Promise<Settings>;
}

export interface Repositories {
  users: UserRepository;
  profiles: ProfileRepository;
  companies: CompanyRepository;
  jobs: JobRepository;
  matches: MatchRepository;
  applications: ApplicationRepository;
  outreach: OutreachRepository;
  settings: SettingsRepository;
}
