"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Icon } from "@/components/ui";
import { MessageList } from "./message-list";
import type { ChatMessage, ChatToolResult } from "./types";

type ChatEvent =
  | { type: "text"; delta: string }
  | { type: "tool_call"; id: string; tool: string; input: unknown }
  | { type: "tool_result"; id: string; tool: string; output: unknown }
  | { type: "error"; message: string }
  | { type: "done" };

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi, I'm Envoy. I can find roles worth your time, map who to reach, draft outreach you approve, tailor your résumé per posting, and research companies before interviews. What would you like to start with?",
};

const SUGGESTED = [
  "Find me senior frontend roles",
  "Draft a warm intro to a hiring manager",
  "Research Northwind for my interview",
];

function parseSSE(buffer: string): { events: ChatEvent[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const events: ChatEvent[] = [];
  for (const part of parts) {
    const line = part.replace(/^data: /, "").trim();
    if (!line) continue;
    try {
      events.push(JSON.parse(line) as ChatEvent);
    } catch {
      /* ignore partial */
    }
  }
  return { events, rest };
}

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const nextId = () => `m${(idRef.current += 1)}`;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  // Hydrate a persisted thread (mock-first, per process). Keeps the welcome
  // when the thread is empty.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/chat/thread");
        if (!res.ok) return;
        const data = (await res.json()) as {
          messages: { role: "user" | "assistant"; text: string; toolResults?: ChatToolResult[] }[];
        };
        if (active && data.messages.length > 0) {
          setMessages(
            data.messages.map((m, i) => ({
              id: `h${i}`,
              role: m.role,
              text: m.text,
              toolResults: m.toolResults,
            })),
          );
        }
      } catch {
        /* keep the welcome message */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function patch(id: string, fn: (m: ChatMessage) => ChatMessage) {
    setMessages((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setBusy(true);
    setInput("");

    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.text }));
    const userMsg: ChatMessage = { id: nextId(), role: "user", text: content };
    const assistantId = nextId();
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", text: "", streaming: true, toolResults: [] },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history }),
      });
      if (!res.ok || !res.body) throw new Error("stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const { events, rest } = parseSSE(buffer);
        buffer = rest;
        for (const ev of events) {
          if (ev.type === "text") {
            patch(assistantId, (m) => ({ ...m, text: m.text + ev.delta }));
          } else if (ev.type === "tool_result") {
            const result: ChatToolResult = { id: ev.id, tool: ev.tool, output: ev.output };
            patch(assistantId, (m) => ({ ...m, toolResults: [...(m.toolResults ?? []), result] }));
          } else if (ev.type === "error") {
            patch(assistantId, (m) => ({ ...m, text: m.text || `Something went wrong: ${ev.message}` }));
          }
        }
      }
    } catch {
      patch(assistantId, (m) => ({
        ...m,
        text: m.text || "Sorry, I couldn't reach the copilot. Try again.",
      }));
    } finally {
      patch(assistantId, (m) => ({ ...m, streaming: false }));
      setBusy(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  return (
    <div className="chat">
      <div className="chat__list" ref={listRef}>
        <MessageList messages={messages} />
      </div>

      {messages.length <= 1 ? (
        <div className="suggested">
          {SUGGESTED.map((s) => (
            <button key={s} type="button" onClick={() => void send(s)}>
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <div className="chat__composer">
        <textarea
          rows={1}
          placeholder="Message Envoy…"
          aria-label="Message Envoy"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className="send"
          aria-label="Send"
          disabled={busy || input.trim().length === 0}
          onClick={() => void send(input)}
        >
          <Icon icon={Send} size={16} />
        </button>
      </div>
    </div>
  );
}
