import type { ToolSpec } from "./registry";

export interface AgentMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
  toolCallId?: string;
}

export interface LLMToolCall {
  id: string;
  name: string;
  input: unknown;
}

export type LLMStreamEvent =
  | { type: "text"; delta: string }
  | { type: "tool_call"; call: LLMToolCall }
  | { type: "stop" };

export interface LLMRequest {
  system: string;
  messages: AgentMessage[];
  tools: ToolSpec[];
}

/** Streaming LLM. Mock = scripted; Phase 20 = Anthropic Claude via the AI SDK. */
export interface LLMProvider {
  stream(req: LLMRequest): AsyncIterable<LLMStreamEvent>;
}

function extractCompany(text: string): string | undefined {
  const m = text.match(/\b(?:at|to|with|for)\s+([A-Z][A-Za-z0-9&.\- ]{1,30}?)(?:[.?!,]|$| role| team)/);
  return m?.[1]?.trim();
}

interface ScriptedTurn {
  toolCall?: { name: string; input: unknown };
  text?: string;
}

/**
 * Scripted mock LLM. Decides a single tool call from the latest user message,
 * then — once the tool result arrives — produces a final, plain-English reply.
 * Token-streams its text word by word so the UI behaves like the real thing.
 */
export class ScriptedMockProvider implements LLMProvider {
  private counter = 0;

  private decide(req: LLMRequest): ScriptedTurn {
    const last = req.messages[req.messages.length - 1];

    // After a tool result, summarize it.
    if (last?.role === "tool") {
      let output: unknown = null;
      try {
        output = JSON.parse(last.content);
      } catch {
        output = null;
      }
      return { text: this.summarize(last.toolName ?? "", output) };
    }

    const user = [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const t = user.toLowerCase();

    if (/\b(draft|outreach|intro|reach out|connect)\b/.test(t)) {
      return {
        toolCall: {
          name: "draft_outreach",
          input: {
            target: { archetype: "Hiring manager", rationale: "Owns the role and the decision." },
            channel: "email",
          },
        },
      };
    }
    if (/\b(find|role|match|job|opening|position)\b/.test(t)) {
      return { toolCall: { name: "find_roles", input: { limit: 5 } } };
    }
    if (/\b(tailor|résumé|resume|cover letter)\b/.test(t)) {
      return { toolCall: { name: "tailor_resume", input: {} } };
    }
    if (/\b(research|company|interview|prep|dossier)\b/.test(t)) {
      return {
        toolCall: {
          name: "research_company",
          input: { company: extractCompany(user) ?? "the company" },
        },
      };
    }
    if (/\bwho\b.*\b(contact|reach|connect)\b|map contacts/.test(t)) {
      return { toolCall: { name: "map_contacts", input: {} } };
    }
    if (/\b(track|applied|application)\b/.test(t)) {
      return { toolCall: { name: "track_application", input: { stage: "applied" } } };
    }

    return {
      text: "I can find roles for you, map who to reach, draft outreach you approve, tailor your résumé per posting, and research companies before interviews. What would you like to start with?",
    };
  }

  private summarize(tool: string, output: unknown): string {
    if (tool === "find_roles" && output && typeof output === "object" && "matches" in output) {
      const matches = (output as { matches: unknown[] }).matches;
      const n = Array.isArray(matches) ? matches.length : 0;
      return `Found ${n} strong match${n === 1 ? "" : "es"}. They're ranked on your matches page, each with the reasoning and gaps behind the fit. Want me to draft a warm intro to one of them? You'll approve it before anything sends.`;
    }
    if (tool === "draft_outreach") {
      return "I've drafted a few tone variants for you to review. Nothing sends until you approve a specific message — you can copy it or open it in mail.";
    }
    if (tool === "tailor_resume") {
      return "I tailored your résumé and a cover letter for this role, with a diff so you can see what changed. I only reworded what's true — no fabricated experience.";
    }
    if (tool === "research_company") {
      return "Here's your dossier: an overview, likely interview questions, and smart questions to ask. It's built from public sources only.";
    }
    if (tool === "map_contacts") {
      return "Here are the right people to reach and why. These are roles and publicly-listed names only — I never scrape private contact info.";
    }
    if (tool === "track_application") {
      return "Tracked it. You'll see it move through your pipeline, and I'll nudge you about follow-ups.";
    }
    return "Done.";
  }

  async *stream(req: LLMRequest): AsyncIterable<LLMStreamEvent> {
    const turn = this.decide(req);
    if (turn.toolCall) {
      this.counter += 1;
      yield {
        type: "tool_call",
        call: {
          id: `call_${this.counter.toString().padStart(3, "0")}`,
          name: turn.toolCall.name,
          input: turn.toolCall.input,
        },
      };
      yield { type: "stop" };
      return;
    }
    for (const word of (turn.text ?? "").split(" ")) {
      yield { type: "text", delta: `${word} ` };
    }
    yield { type: "stop" };
  }
}

let cached: LLMProvider | null = null;

export function getLLMProvider(): LLMProvider {
  if (!cached) cached = new ScriptedMockProvider();
  return cached;
}
