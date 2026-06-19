import type {
  Application,
  CandidateProfile,
  Company,
  Job,
  Match,
  Outreach,
  Settings,
  User,
} from "@prisma/client";

/** Fixed clock so mock writes are deterministic in tests. */
export const MOCK_NOW = new Date("2026-06-01T00:00:00.000Z");

export interface MockData {
  users?: User[];
  profiles?: CandidateProfile[];
  companies?: Company[];
  jobs?: Job[];
  matches?: Match[];
  applications?: Application[];
  outreach?: Outreach[];
  settings?: Settings[];
}

function clone<T>(rows: T[]): T[] {
  return rows.map((r) => structuredClone(r));
}

/**
 * In-memory data source for mock mode. Deep-clones seed fixtures so tests can
 * mutate freely without touching the shared fixtures.
 */
export class MockStore {
  users: User[] = [];
  profiles: CandidateProfile[] = [];
  companies: Company[] = [];
  jobs: Job[] = [];
  matches: Match[] = [];
  applications: Application[] = [];
  outreach: Outreach[] = [];
  settings: Settings[] = [];
  private seq = 0;

  seed(data: MockData): this {
    this.users = clone(data.users ?? []);
    this.profiles = clone(data.profiles ?? []);
    this.companies = clone(data.companies ?? []);
    this.jobs = clone(data.jobs ?? []);
    this.matches = clone(data.matches ?? []);
    this.applications = clone(data.applications ?? []);
    this.outreach = clone(data.outreach ?? []);
    this.settings = clone(data.settings ?? []);
    return this;
  }

  /** Deterministic id, e.g. mock_match_0001. */
  id(prefix: string): string {
    this.seq += 1;
    return `mock_${prefix}_${this.seq.toString().padStart(4, "0")}`;
  }
}
