"use client";

import { useEffect, useRef, useState } from "react";
import { MessageList } from "./message-list";
import type { ChatMessage } from "./types";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi — I'm Envoy. I can find roles worth your time, map who to reach, draft outreach you approve, tailor your résumé per posting, and research companies before interviews. What would you like to start with?",
};

export function ChatView() {
  const [messages] = useState<ChatMessage[]>([WELCOME]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  return (
    <div className="chat">
      <div className="chat__list" ref={listRef}>
        <MessageList messages={messages} />
      </div>
    </div>
  );
}
