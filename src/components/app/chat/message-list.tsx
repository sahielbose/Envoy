import { cn } from "@/lib/utils";
import type { ChatMessage } from "./types";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="bubbles">
      {messages.map((m) => (
        <div key={m.id} className={cn("bub", m.role === "user" ? "bub--me" : "bub--ai")}>
          {m.text}
          {m.streaming && m.text.length === 0 ? (
            <span className="typing" aria-label="Envoy is thinking">
              <span />
              <span />
              <span />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
