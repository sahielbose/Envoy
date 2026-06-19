import type { ToolInput, ToolOutput } from "@/server/tools/contracts";

/**
 * The core capabilities, one method per tool. These plain service functions are
 * callable by the agent now and wrappable as MCP tools later. Every method's
 * input/output is the zod-validated tool contract.
 */
export interface EnvoyServices {
  parseResume(input: ToolInput<"parse_resume">): Promise<ToolOutput<"parse_resume">>;
  buildProfile(input: ToolInput<"build_profile">): Promise<ToolOutput<"build_profile">>;
  findRoles(input: ToolInput<"find_roles">): Promise<ToolOutput<"find_roles">>;
  tailorResume(input: ToolInput<"tailor_resume">): Promise<ToolOutput<"tailor_resume">>;
  researchCompany(input: ToolInput<"research_company">): Promise<ToolOutput<"research_company">>;
  mapContacts(input: ToolInput<"map_contacts">): Promise<ToolOutput<"map_contacts">>;
  draftOutreach(input: ToolInput<"draft_outreach">): Promise<ToolOutput<"draft_outreach">>;
  trackApplication(input: ToolInput<"track_application">): Promise<ToolOutput<"track_application">>;
}
