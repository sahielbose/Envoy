import { describe, it, expect } from "vitest";
import { runAgent, type AgentEvent } from "./loop";
import { TOOL_NAMES } from "./registry";
import { buildSystemPrompt, HARD_RULES } from "./system-prompt";
import type { ExecutionContext } from "./registry";
import type { LLMProvider } from "./llm";
import { createServices } from "@/server/services";
import { createTestRepositories } from "@/server/repositories";

function makeContext(): { context: ExecutionContext; repositories: ReturnType<typeof createTestRepositories>["repositories"] } {
  const { repositories } = createTestRepositories();
  const context: ExecutionContext = {
    services: createServices({ repositories }),
    userId: "demo-user",
    profileId: "demo-profile",
    defaultJobId: "job-northwind-fe",
  };
  return { context, repositories };
}

async function collect(events: AsyncIterable<AgentEvent>): Promise<AgentEvent[]> {
  const out: AgentEvent[] = [];
  for await (const e of events) out.push(e);
  return out;
}

const results = (events: AgentEvent[]) =>
  events.filter((e): e is Extract<AgentEvent, { type: "tool_result" }> => e.type === "tool_result");
const text = (events: AgentEvent[]) =>
  events
    .filter((e): e is Extract<AgentEvent, { type: "text" }> => e.type === "text")
    .map((e) => e.delta)
    .join("");

const SYSTEM = buildSystemPrompt({ userName: "Alex" });

describe("agent tool-use loop", () => {
  it("runs find_roles and summarizes the result", async () => {
    const { context } = makeContext();
    const events = await collect(runAgent({ context, system: SYSTEM, userMessage: "Find me senior frontend roles" }));

    const call = events.find((e) => e.type === "tool_call");
    expect(call?.type === "tool_call" && call.tool).toBe("find_roles");

    const fr = results(events).find((r) => r.tool === "find_roles");
    expect(fr).toBeDefined();
    expect((fr?.output as { matches: unknown[] }).matches.length).toBeGreaterThan(0);

    expect(text(events).toLowerCase()).toContain("match");
    expect(events.at(-1)?.type).toBe("done");
  });

  it("replies with text and no tool call for a greeting", async () => {
    const { context } = makeContext();
    const events = await collect(runAgent({ context, system: SYSTEM, userMessage: "hey, what can you do" }));
    expect(events.some((e) => e.type === "tool_call")).toBe(false);
    expect(text(events).length).toBeGreaterThan(0);
  });

  it("surfaces an error for an unknown / unsafe tool", async () => {
    const { context } = makeContext();
    const provider: LLMProvider = {
      async *stream() {
        yield { type: "tool_call", call: { id: "x", name: "send_email", input: {} } };
        yield { type: "stop" };
      },
    };
    const events = await collect(
      runAgent({ context, system: SYSTEM, userMessage: "send it", provider }),
    );
    expect(events.some((e) => e.type === "error")).toBe(true);
  });
});

describe("guardrails", () => {
  it("exposes only the eight safe tools — none that send/apply/submit", () => {
    expect([...TOOL_NAMES].sort()).toEqual([
      "build_profile",
      "draft_outreach",
      "find_roles",
      "map_contacts",
      "parse_resume",
      "research_company",
      "tailor_resume",
      "track_application",
    ]);
    expect(TOOL_NAMES.some((n) => /send|apply|submit/.test(n))).toBe(false);
  });

  it("system prompt encodes every hard rule", () => {
    for (const rule of HARD_RULES) expect(SYSTEM).toContain(rule);
    expect(SYSTEM).toContain("Alex");
  });

  it("draft_outreach via the agent returns drafts only and never sends", async () => {
    const { context, repositories } = makeContext();
    const events = await collect(
      runAgent({ context, system: SYSTEM, userMessage: "Draft an intro to the hiring manager" }),
    );

    const draft = results(events).find((r) => r.tool === "draft_outreach");
    expect(draft).toBeDefined();
    const output = draft?.output as { drafts: unknown[]; rationale: string };
    expect(output.drafts.length).toBeGreaterThan(0);
    // Output is content only — no transmission fields.
    expect(Object.keys(output).sort()).toEqual(["drafts", "rationale"]);
    // Nothing was sent: no outreach record exists for the user.
    expect(await repositories.outreach.listByUser("demo-user")).toHaveLength(0);
    expect(text(events).toLowerCase()).toContain("approve");
  });
});
