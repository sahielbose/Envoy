import type { z } from "zod";
import { TOOL_CONTRACTS, type ToolName } from "@/server/tools/contracts";
import type { EnvoyServices } from "@/server/services";

/** Per-conversation context the tools run against. */
export interface ExecutionContext {
  services: EnvoyServices;
  userId: string;
  profileId: string;
  /** A sensible default job for chat actions like "draft an intro". */
  defaultJobId?: string;
}

type ToolHandler = (ctx: ExecutionContext, input: unknown) => Promise<unknown>;

function merge(input: unknown, defaults: Record<string, unknown>): Record<string, unknown> {
  return { ...defaults, ...(typeof input === "object" && input !== null ? input : {}) };
}

/**
 * Tool handlers. Each validates the merged input through its contract schema and
 * delegates to the service. Owner context (profileId/userId) is injected so the
 * model never has to know ids. No handler can send/submit anything.
 */
const HANDLERS: Record<ToolName, ToolHandler> = {
  parse_resume: (ctx, input) =>
    ctx.services.parseResume(TOOL_CONTRACTS.parse_resume.input.parse(input)),
  build_profile: (ctx, input) =>
    ctx.services.buildProfile(
      TOOL_CONTRACTS.build_profile.input.parse(merge(input, { userId: ctx.userId })),
    ),
  find_roles: (ctx, input) =>
    ctx.services.findRoles(
      TOOL_CONTRACTS.find_roles.input.parse(merge(input, { profileId: ctx.profileId })),
    ),
  tailor_resume: (ctx, input) =>
    ctx.services.tailorResume(
      TOOL_CONTRACTS.tailor_resume.input.parse(
        merge(input, { profileId: ctx.profileId, jobId: ctx.defaultJobId }),
      ),
    ),
  research_company: (ctx, input) =>
    ctx.services.researchCompany(TOOL_CONTRACTS.research_company.input.parse(input)),
  map_contacts: (ctx, input) =>
    ctx.services.mapContacts(
      TOOL_CONTRACTS.map_contacts.input.parse(
        merge(input, { profileId: ctx.profileId, jobId: ctx.defaultJobId }),
      ),
    ),
  draft_outreach: (ctx, input) =>
    ctx.services.draftOutreach(
      TOOL_CONTRACTS.draft_outreach.input.parse(
        merge(input, { profileId: ctx.profileId, jobId: ctx.defaultJobId }),
      ),
    ),
  track_application: (ctx, input) =>
    ctx.services.trackApplication(
      TOOL_CONTRACTS.track_application.input.parse(merge(input, { userId: ctx.userId })),
    ),
};

export const TOOL_NAMES = Object.keys(TOOL_CONTRACTS) as ToolName[];

export function isToolName(name: string): name is ToolName {
  return Object.prototype.hasOwnProperty.call(TOOL_CONTRACTS, name);
}

export async function executeTool(
  ctx: ExecutionContext,
  name: ToolName,
  input: unknown,
): Promise<unknown> {
  return HANDLERS[name](ctx, input);
}

export interface ToolSpec {
  name: ToolName;
  description: string;
  inputSchema: z.ZodTypeAny;
}

export function toolSpecs(): ToolSpec[] {
  return TOOL_NAMES.map((name) => ({
    name,
    description: TOOL_CONTRACTS[name].description,
    inputSchema: TOOL_CONTRACTS[name].input,
  }));
}
