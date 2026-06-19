import type { PrismaClient } from "@prisma/client";
import type {
  ApplicationRepository,
  CompanyRepository,
  JobRepository,
  MatchRepository,
  OutreachRepository,
  ProfileRepository,
  Repositories,
  SettingsRepository,
  UserRepository,
} from "./types";

/** Build the Prisma-backed repository bundle (used when USE_MOCKS=false). */
export function createPrismaRepositories(prisma: PrismaClient): Repositories {
  const users: UserRepository = {
    findById: (id) => prisma.user.findUnique({ where: { id } }),
    findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  };

  const profiles: ProfileRepository = {
    findById: (id) => prisma.candidateProfile.findUnique({ where: { id } }),
    findByUserId: (userId) => prisma.candidateProfile.findUnique({ where: { userId } }),
    upsert: (input) =>
      prisma.candidateProfile.upsert({
        where: { userId: input.userId },
        create: {
          userId: input.userId,
          linkedinUrl: input.linkedinUrl ?? null,
          baseResumeId: input.baseResumeId ?? null,
          rawResumeText: input.rawResumeText ?? null,
          structured: input.structured,
          preferences: input.preferences,
          summary: input.summary ?? null,
        },
        update: {
          linkedinUrl: input.linkedinUrl ?? undefined,
          baseResumeId: input.baseResumeId ?? undefined,
          rawResumeText: input.rawResumeText ?? undefined,
          structured: input.structured,
          preferences: input.preferences,
          summary: input.summary ?? undefined,
        },
      }),
  };

  const companies: CompanyRepository = {
    findById: (id) => prisma.company.findUnique({ where: { id } }),
    findByName: (name) => prisma.company.findUnique({ where: { name } }),
    list: () => prisma.company.findMany({ orderBy: { name: "asc" } }),
    upsert: (input) =>
      prisma.company.upsert({
        where: { name: input.name },
        create: {
          name: input.name,
          domain: input.domain ?? null,
          dossier: input.dossier,
          dossierAt: input.dossierAt ?? null,
        },
        update: {
          domain: input.domain ?? undefined,
          dossier: input.dossier,
          dossierAt: input.dossierAt ?? undefined,
        },
      }),
  };

  const jobs: JobRepository = {
    findById: (id) => prisma.job.findUnique({ where: { id } }),
    findByIds: (ids) => prisma.job.findMany({ where: { id: { in: ids } } }),
    list: (filter) =>
      prisma.job.findMany({
        where: {
          remote: filter?.remote,
          companyId: filter?.companyId,
          source: filter?.source,
        },
      }),
    upsertBySource: (input) =>
      prisma.job.upsert({
        where: { source_sourceJobId: { source: input.source, sourceJobId: input.sourceJobId } },
        create: {
          source: input.source,
          sourceJobId: input.sourceJobId,
          companyId: input.companyId ?? null,
          title: input.title,
          location: input.location ?? null,
          remote: input.remote ?? false,
          description: input.description,
          url: input.url,
          postedAt: input.postedAt ?? null,
        },
        update: {
          companyId: input.companyId ?? undefined,
          title: input.title,
          location: input.location ?? undefined,
          remote: input.remote ?? undefined,
          description: input.description,
          url: input.url,
          postedAt: input.postedAt ?? undefined,
        },
      }),
    count: () => prisma.job.count(),
  };

  const matches: MatchRepository = {
    listByProfile: (profileId, status) =>
      prisma.match.findMany({
        where: { profileId, status },
        orderBy: { score: "desc" },
      }),
    findByProfileAndJob: (profileId, jobId) =>
      prisma.match.findUnique({ where: { profileId_jobId: { profileId, jobId } } }),
    upsert: (input) =>
      prisma.match.upsert({
        where: { profileId_jobId: { profileId: input.profileId, jobId: input.jobId } },
        create: {
          profileId: input.profileId,
          jobId: input.jobId,
          score: input.score,
          reasoning: input.reasoning,
          gaps: input.gaps,
          status: input.status ?? "new",
        },
        update: {
          score: input.score,
          reasoning: input.reasoning,
          gaps: input.gaps,
          status: input.status ?? undefined,
        },
      }),
    setStatus: (id, status) => prisma.match.update({ where: { id }, data: { status } }),
  };

  const applications: ApplicationRepository = {
    findById: (id) => prisma.application.findUnique({ where: { id } }),
    listByUser: (userId) => prisma.application.findMany({ where: { userId } }),
    create: (input) =>
      prisma.application.create({
        data: {
          userId: input.userId,
          jobId: input.jobId,
          stage: input.stage ?? "saved",
          notes: input.notes ?? null,
          nextAction: input.nextAction,
          resumeFileId: input.resumeFileId ?? null,
        },
      }),
    update: (id, patch) =>
      prisma.application.update({
        where: { id },
        data: {
          stage: patch.stage,
          notes: patch.notes,
          nextAction: patch.nextAction,
          resumeFileId: patch.resumeFileId,
        },
      }),
  };

  const outreach: OutreachRepository = {
    findById: (id) => prisma.outreach.findUnique({ where: { id } }),
    listByUser: (userId) => prisma.outreach.findMany({ where: { userId } }),
    create: (input) =>
      prisma.outreach.create({
        data: {
          userId: input.userId,
          jobId: input.jobId,
          target: input.target,
          channel: input.channel,
          drafts: input.drafts,
          status: input.status ?? "draft",
        },
      }),
    update: (id, patch) =>
      prisma.outreach.update({
        where: { id },
        data: {
          status: patch.status,
          drafts: patch.drafts,
          sentVia: patch.sentVia,
          sentAt: patch.sentAt,
        },
      }),
  };

  const settings: SettingsRepository = {
    findByUserId: (userId) => prisma.settings.findUnique({ where: { userId } }),
    upsert: (input) =>
      prisma.settings.upsert({
        where: { userId: input.userId },
        create: {
          userId: input.userId,
          notifyEmail: input.notifyEmail ?? true,
          cronMatchWeekly: input.cronMatchWeekly ?? true,
          cronFollowups: input.cronFollowups ?? true,
          gmailConnected: input.gmailConnected ?? false,
        },
        update: {
          notifyEmail: input.notifyEmail,
          cronMatchWeekly: input.cronMatchWeekly,
          cronFollowups: input.cronFollowups,
          gmailConnected: input.gmailConnected,
        },
      }),
  };

  return { users, profiles, companies, jobs, matches, applications, outreach, settings };
}
