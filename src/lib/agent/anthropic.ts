import { streamText, tool, type CoreMessage } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { env, requireProvider } from "@/lib/env";
import type { AgentMessage, LLMProvider, LLMRequest, LLMStreamEvent } from "./llm";

const DEFAULT_MODEL = "claude-opus-4-8";

/** Flatten our message log to AI-SDK messages. Tool results become readable
 * context so the model can summarize them on the next turn. */
function toCoreMessages(messages: AgentMessage[]): CoreMessage[] {
  const out: CoreMessage[] = [];
  for (const m of messages) {
    if (m.role === "tool") {
      out.push({ role: "user", content: `Result from ${m.toolName ?? "tool"}: ${m.content}` });
    } else if (m.role === "assistant") {
      if (m.content.trim().length > 0) out.push({ role: "assistant", content: m.content });
    } else {
      out.push({ role: "user", content: m.content });
    }
  }
  return out;
}

/** Real LLM provider, Anthropic Claude via the Vercel AI SDK. */
export class AnthropicLLMProvider implements LLMProvider {
  private readonly model;

  constructor() {
    requireProvider("llm");
    // Live read so a key added at runtime (Settings) is used without a restart.
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? env.ANTHROPIC_API_KEY });
    this.model = anthropic(process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL);
  }

  async *stream(req: LLMRequest): AsyncIterable<LLMStreamEvent> {
    const tools = Object.fromEntries(
      req.tools.map((t) => [t.name, tool({ description: t.description, parameters: t.inputSchema })]),
    );

    const result = streamText({
      model: this.model,
      system: req.system,
      messages: toCoreMessages(req.messages),
      tools,
      toolChoice: "auto",
    });

    for await (const part of result.fullStream) {
      if (part.type === "text-delta") {
        yield { type: "text", delta: part.textDelta };
      } else if (part.type === "tool-call") {
        yield {
          type: "tool_call",
          call: { id: part.toolCallId, name: part.toolName, input: part.args },
        };
      }
    }
    yield { type: "stop" };
  }
}
