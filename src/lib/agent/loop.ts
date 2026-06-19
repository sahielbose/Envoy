import { executeTool, isToolName, toolSpecs, type ExecutionContext } from "./registry";
import { getLLMProvider, type AgentMessage, type LLMProvider, type LLMToolCall } from "./llm";

export type AgentEvent =
  | { type: "text"; delta: string }
  | { type: "tool_call"; id: string; tool: string; input: unknown }
  | { type: "tool_result"; id: string; tool: string; output: unknown }
  | { type: "error"; message: string }
  | { type: "done" };

export interface RunAgentInput {
  context: ExecutionContext;
  system: string;
  history?: AgentMessage[];
  userMessage: string;
  provider?: LLMProvider;
  maxSteps?: number;
}

/**
 * The Envoy agent loop: stream LLM output, execute any tool call via the
 * registry, feed the result back, and continue until the model produces a final
 * reply (or maxSteps is reached). Yields a flat event stream the UI/SSE consumes.
 */
export async function* runAgent(input: RunAgentInput): AsyncIterable<AgentEvent> {
  const provider = input.provider ?? getLLMProvider();
  const tools = toolSpecs();
  const messages: AgentMessage[] = [
    ...(input.history ?? []),
    { role: "user", content: input.userMessage },
  ];
  const maxSteps = input.maxSteps ?? 6;

  for (let step = 0; step < maxSteps; step++) {
    let toolCall: LLMToolCall | null = null;
    let text = "";

    for await (const event of provider.stream({ system: input.system, messages, tools })) {
      if (event.type === "text") {
        text += event.delta;
        yield { type: "text", delta: event.delta };
      } else if (event.type === "tool_call") {
        toolCall = event.call;
      } else if (event.type === "stop") {
        break;
      }
    }

    if (!toolCall) {
      if (text) messages.push({ role: "assistant", content: text });
      break;
    }

    if (!isToolName(toolCall.name)) {
      yield { type: "error", message: `Unknown tool: ${toolCall.name}` };
      break;
    }

    yield { type: "tool_call", id: toolCall.id, tool: toolCall.name, input: toolCall.input };
    messages.push({
      role: "assistant",
      content: "",
      toolName: toolCall.name,
      toolCallId: toolCall.id,
    });

    try {
      const output = await executeTool(input.context, toolCall.name, toolCall.input);
      yield { type: "tool_result", id: toolCall.id, tool: toolCall.name, output };
      messages.push({
        role: "tool",
        content: JSON.stringify(output),
        toolName: toolCall.name,
        toolCallId: toolCall.id,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Tool failed.";
      yield { type: "error", message };
      messages.push({
        role: "tool",
        content: JSON.stringify({ error: message }),
        toolName: toolCall.name,
        toolCallId: toolCall.id,
      });
    }
  }

  yield { type: "done" };
}
