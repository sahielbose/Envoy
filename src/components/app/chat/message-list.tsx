import { cn } from "@/lib/utils";
import type { ChatMessage } from "./types";
import { ToolResultView } from "./tool-result";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="bubbles">
      {messages.map((m) => (
        <div key={m.id} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "84%" }}>
          <div className={cn("bub", m.role === "user" ? "bub--me" : "bub--ai")} style={{ maxWidth: "100%" }}>
            {m.text}
            {m.streaming && m.text.length === 0 ? (
              <span className="typing" aria-label="Envoy is thinking">
                <span />
                <span />
                <span />
              </span>
            ) : null}
          </div>
          {m.toolResults?.map((r) => <ToolResultView key={r.id} result={r} />)}
        </div>
      ))}
    </div>
  );
}
