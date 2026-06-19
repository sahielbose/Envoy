import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepositories, type Repositories } from "@/server/repositories";
import { getServices } from "@/server/services";
import { runAgent, type AgentEvent } from "@/lib/agent/loop";
import { toSSEStream, SSE_HEADERS } from "@/lib/agent/sse";
import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import type { AgentMessage } from "@/lib/agent/llm";
import type { ExecutionContext } from "@/lib/agent/registry";
import { appendMessage } from "@/server/chat/thread-store";

export const runtime = "nodejs";

const Body = z.object({
  message: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional(),
});

/** Enrich find_roles matches with job title + company for nicer chat cards. */
async function enrichMatches(output: unknown, repos: Repositories): Promise<unknown> {
  const rec = output as {
    matches?: { jobId: string; score: number; reasoning: string; gaps: string[] }[];
  };
  const matches = rec.matches ?? [];
  const jobs = await repos.jobs.findByIds(matches.map((m) => m.jobId));
  const jobById = new Map(jobs.map((j) => [j.id, j]));
  const companyById = new Map((await repos.companies.list()).map((c) => [c.id, c.name]));
  return {
    matches: matches.map((m) => {
      const job = jobById.get(m.jobId);
      return {
        ...m,
        title: job?.title ?? null,
        company: job ? (companyById.get(job.companyId ?? "") ?? null) : null,
      };
    }),
  };
}

async function* process(
  events: AsyncIterable<AgentEvent>,
  repos: Repositories,
  userId: string,
): AsyncIterable<AgentEvent> {
  let text = "";
  const toolResults: { id: string; tool: string; output: unknown }[] = [];

  for await (const event of events) {
    let out = event;
    if (out.type === "tool_result" && out.tool === "find_roles") {
      out = { ...out, output: await enrichMatches(out.output, repos) };
    }
    if (out.type === "text") text += out.delta;
    if (out.type === "tool_result") toolResults.push({ id: out.id, tool: out.tool, output: out.output });
    if (out.type === "done") {
      appendMessage(userId, { role: "assistant", text, toolResults });
    }
    yield out;
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "A message is required." }, { status: 400 });
  }

  const repos = getRepositories();
  const profile = await repos.profiles.findByUserId(session.user.id);
  if (!profile) {
    return Response.json({ error: "Complete onboarding first." }, { status: 400 });
  }

  const topMatch = (await repos.matches.listByProfile(profile.id)).find(
    (m) => m.status !== "dismissed",
  );

  const context: ExecutionContext = {
    services: getServices(),
    userId: session.user.id,
    profileId: profile.id,
    defaultJobId: topMatch?.jobId,
  };
  const system = buildSystemPrompt({
    userName: session.user.name,
    profileSummary: profile.summary ?? undefined,
  });
  const history: AgentMessage[] = (parsed.data.history ?? []).map((h) => ({
    role: h.role,
    content: h.content,
  }));

  appendMessage(session.user.id, { role: "user", text: parsed.data.message });

  const events = process(
    runAgent({ context, system, history, userMessage: parsed.data.message }),
    repos,
    session.user.id,
  );

  return new Response(toSSEStream(events), { headers: SSE_HEADERS });
}
