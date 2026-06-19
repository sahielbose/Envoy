import type {
  Application,
  CandidateProfile,
  Company,
  Job,
  Match,
  Outreach,
  Prisma,
  Settings,
} from "@prisma/client";
import { MOCK_NOW, MockStore } from "./mock-store";
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

const json = (v: Prisma.InputJsonValue): Prisma.JsonValue => v as unknown as Prisma.JsonValue;

/** Build the mock repository bundle over an in-memory store. */
export function createMockRepositories(store: MockStore): Repositories {
  const users: UserRepository = {
    async findById(id) {
      return store.users.find((u) => u.id === id) ?? null;
    },
    async findByEmail(email) {
      return store.users.find((u) => u.email === email) ?? null;
    },
  };

  const profiles: ProfileRepository = {
    async findById(id) {
      return store.profiles.find((p) => p.id === id) ?? null;
    },
    async findByUserId(userId) {
      return store.profiles.find((p) => p.userId === userId) ?? null;
    },
    async list() {
      return [...store.profiles];
    },
    async upsert(input) {
      const existing = store.profiles.find((p) => p.userId === input.userId);
      if (existing) {
        existing.linkedinUrl = input.linkedinUrl ?? existing.linkedinUrl;
        existing.baseResumeId = input.baseResumeId ?? existing.baseResumeId;
        existing.rawResumeText = input.rawResumeText ?? existing.rawResumeText;
        existing.structured = json(input.structured);
        existing.preferences = json(input.preferences);
        existing.summary = input.summary ?? existing.summary;
        existing.updatedAt = MOCK_NOW;
        return existing;
      }
      const created: CandidateProfile = {
        id: store.id("profile"),
        userId: input.userId,
        linkedinUrl: input.linkedinUrl ?? null,
        baseResumeId: input.baseResumeId ?? null,
        rawResumeText: input.rawResumeText ?? null,
        structured: json(input.structured),
        preferences: json(input.preferences),
        summary: input.summary ?? null,
        updatedAt: MOCK_NOW,
      };
      store.profiles.push(created);
      return created;
    },
  };

  const companies: CompanyRepository = {
    async findById(id) {
      return store.companies.find((c) => c.id === id) ?? null;
    },
    async findByName(name) {
      return store.companies.find((c) => c.name === name) ?? null;
    },
    async list() {
      return [...store.companies];
    },
    async upsert(input) {
      const existing = store.companies.find((c) => c.name === input.name);
      if (existing) {
        existing.domain = input.domain ?? existing.domain;
        if (input.dossier !== undefined) existing.dossier = json(input.dossier);
        existing.dossierAt = input.dossierAt ?? existing.dossierAt;
        return existing;
      }
      const created: Company = {
        id: store.id("company"),
        name: input.name,
        domain: input.domain ?? null,
        dossier: input.dossier === undefined ? null : json(input.dossier),
        dossierAt: input.dossierAt ?? null,
      };
      store.companies.push(created);
      return created;
    },
  };

  const jobs: JobRepository = {
    async findById(id) {
      return store.jobs.find((j) => j.id === id) ?? null;
    },
    async findByIds(ids) {
      const set = new Set(ids);
      return store.jobs.filter((j) => set.has(j.id));
    },
    async list(filter) {
      return store.jobs.filter((j) => {
        if (filter?.remote !== undefined && j.remote !== filter.remote) return false;
        if (filter?.companyId !== undefined && j.companyId !== filter.companyId) return false;
        if (filter?.source !== undefined && j.source !== filter.source) return false;
        return true;
      });
    },
    async upsertBySource(input) {
      const existing = store.jobs.find(
        (j) => j.source === input.source && j.sourceJobId === input.sourceJobId,
      );
      if (existing) {
        existing.companyId = input.companyId ?? existing.companyId;
        existing.title = input.title;
        existing.location = input.location ?? existing.location;
        existing.remote = input.remote ?? existing.remote;
        existing.description = input.description;
        existing.url = input.url;
        existing.postedAt = input.postedAt ?? existing.postedAt;
        return existing;
      }
      const created: Job = {
        id: store.id("job"),
        source: input.source,
        sourceJobId: input.sourceJobId,
        companyId: input.companyId ?? null,
        title: input.title,
        location: input.location ?? null,
        remote: input.remote ?? false,
        description: input.description,
        url: input.url,
        postedAt: input.postedAt ?? null,
        ingestedAt: MOCK_NOW,
      };
      store.jobs.push(created);
      return created;
    },
    async count() {
      return store.jobs.length;
    },
  };

  const matches: MatchRepository = {
    async listByProfile(profileId, status) {
      return store.matches
        .filter((m) => m.profileId === profileId && (status ? m.status === status : true))
        .sort((a, b) => b.score - a.score);
    },
    async findByProfileAndJob(profileId, jobId) {
      return store.matches.find((m) => m.profileId === profileId && m.jobId === jobId) ?? null;
    },
    async upsert(input) {
      const existing = store.matches.find(
        (m) => m.profileId === input.profileId && m.jobId === input.jobId,
      );
      if (existing) {
        existing.score = input.score;
        existing.reasoning = input.reasoning;
        existing.gaps = json(input.gaps);
        if (input.status) existing.status = input.status;
        return existing;
      }
      const created: Match = {
        id: store.id("match"),
        profileId: input.profileId,
        jobId: input.jobId,
        score: input.score,
        reasoning: input.reasoning,
        gaps: json(input.gaps),
        status: input.status ?? "new",
        createdAt: MOCK_NOW,
      };
      store.matches.push(created);
      return created;
    },
    async setStatus(id, status) {
      const match = store.matches.find((m) => m.id === id);
      if (!match) throw new Error(`Match ${id} not found`);
      match.status = status;
      return match;
    },
  };

  const applications: ApplicationRepository = {
    async findById(id) {
      return store.applications.find((a) => a.id === id) ?? null;
    },
    async listByUser(userId) {
      return store.applications.filter((a) => a.userId === userId);
    },
    async create(input) {
      const created: Application = {
        id: store.id("application"),
        userId: input.userId,
        jobId: input.jobId,
        stage: input.stage ?? "saved",
        notes: input.notes ?? null,
        nextAction: (input.nextAction === undefined
          ? null
          : json(input.nextAction)) as Application["nextAction"],
        resumeFileId: input.resumeFileId ?? null,
        createdAt: MOCK_NOW,
        updatedAt: MOCK_NOW,
      };
      store.applications.push(created);
      return created;
    },
    async update(id, patch) {
      const app = store.applications.find((a) => a.id === id);
      if (!app) throw new Error(`Application ${id} not found`);
      if (patch.stage !== undefined) app.stage = patch.stage;
      if (patch.notes !== undefined) app.notes = patch.notes;
      if (patch.nextAction !== undefined) {
        app.nextAction = json(patch.nextAction) as Application["nextAction"];
      }
      if (patch.resumeFileId !== undefined) app.resumeFileId = patch.resumeFileId;
      app.updatedAt = MOCK_NOW;
      return app;
    },
  };

  const outreach: OutreachRepository = {
    async findById(id) {
      return store.outreach.find((o) => o.id === id) ?? null;
    },
    async listByUser(userId) {
      return store.outreach.filter((o) => o.userId === userId);
    },
    async create(input) {
      const created: Outreach = {
        id: store.id("outreach"),
        userId: input.userId,
        jobId: input.jobId,
        target: json(input.target),
        channel: input.channel,
        drafts: json(input.drafts),
        status: input.status ?? "draft",
        sentVia: null,
        sentAt: null,
        createdAt: MOCK_NOW,
      };
      store.outreach.push(created);
      return created;
    },
    async update(id, patch) {
      const row = store.outreach.find((o) => o.id === id);
      if (!row) throw new Error(`Outreach ${id} not found`);
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.drafts !== undefined) row.drafts = json(patch.drafts);
      if (patch.sentVia !== undefined) row.sentVia = patch.sentVia;
      if (patch.sentAt !== undefined) row.sentAt = patch.sentAt;
      return row;
    },
  };

  const settings: SettingsRepository = {
    async findByUserId(userId) {
      return store.settings.find((s) => s.userId === userId) ?? null;
    },
    async upsert(input) {
      const existing = store.settings.find((s) => s.userId === input.userId);
      if (existing) {
        if (input.notifyEmail !== undefined) existing.notifyEmail = input.notifyEmail;
        if (input.cronMatchWeekly !== undefined) existing.cronMatchWeekly = input.cronMatchWeekly;
        if (input.cronFollowups !== undefined) existing.cronFollowups = input.cronFollowups;
        if (input.gmailConnected !== undefined) existing.gmailConnected = input.gmailConnected;
        return existing;
      }
      const created: Settings = {
        userId: input.userId,
        notifyEmail: input.notifyEmail ?? true,
        cronMatchWeekly: input.cronMatchWeekly ?? true,
        cronFollowups: input.cronFollowups ?? true,
        gmailConnected: input.gmailConnected ?? false,
      };
      store.settings.push(created);
      return created;
    },
  };

  return { users, profiles, companies, jobs, matches, applications, outreach, settings };
}
