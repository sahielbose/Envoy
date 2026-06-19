import { describe, it, expect } from "vitest";
import { runAgent, type AgentEvent } from "@/lib/agent/loop";
import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import { createServices } from "@/server/services";
import { createTestRepositories } from "@/server/repositories";
import { appendMessage, getMessages, resetThread } from "./thread-store";

async function collect(events: AsyncIterable<AgentEvent>): Promise<AgentEvent[]> {
  const out: AgentEvent[] = [];
  for await (const e of events) out.push(e);
  return out;
}

const isResult = (e: AgentEvent): e is Extract<AgentEvent, { type: "tool_result" }> =>
  e.type === "tool_result";
const isText = (e: AgentEvent): e is Extract<AgentEvent, { type: "text" }> => e.type === "text";

describe("thread store", () => {
  it("persists and returns messages per user", () => {
    resetThread("u-test");
    appendMessage("u-test", { role: "user", text: "hi" });
    appendMessage("u-test", { role: "assistant", text: "hello" });
    expect(getMessages("u-test").map((m) => m.role)).toEqual(["user", "assistant"]);
  });
});

describe("chat flow (mock)", () => {
  it("'find me roles' returns inline matches, persists the thread, and updates matches", async () => {
    const { repositories } = createTestRepositories();
    const profile = await repositories.profiles.findByUserId("demo-user");
    if (!profile) throw new Error("seed profile missing");

    const context = {
      services: createServices({ repositories }),
      userId: "demo-user",
      profileId: profile.id,
    };
    const events = await collect(
      runAgent({ context, system: buildSystemPrompt(), userMessage: "Find me senior frontend roles" }),
    );

    const fr = events.find(isResult);
    expect(fr?.tool).toBe("find_roles");
    const matches = (fr?.output as { matches: { jobId: string }[] }).matches;
    expect(matches.length).toBeGreaterThan(0);

    // Enrichment (as the endpoint does): every match resolves to a real job.
    const jobs = await repositories.jobs.findByIds(matches.map((m) => m.jobId));
    expect(jobs.length).toBe(matches.length);

    // Persist the assistant turn and confirm it is retrievable.
    resetThread("demo-user");
    const text = events.filter(isText).map((e) => e.delta).join("");
    appendMessage("demo-user", {
      role: "assistant",
      text,
      toolResults: fr ? [{ id: "1", tool: fr.tool, output: fr.output }] : [],
    });
    expect(getMessages("demo-user")).toHaveLength(1);
    expect(text.toLowerCase()).toContain("match");

    // /matches updates: the pipeline persisted matches for this profile.
    expect((await repositories.matches.listByProfile(profile.id)).length).toBeGreaterThan(0);
  });
});
