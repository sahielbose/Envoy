export interface ThreadMessage {
  role: "user" | "assistant";
  text: string;
  toolResults?: { id: string; tool: string; output: unknown }[];
}

export interface Thread {
  id: string;
  userId: string;
  messages: ThreadMessage[];
}

/**
 * In-memory chat persistence (mock). One thread per user, kept for the process
 * lifetime. Phase 20 backs this with a real store.
 */
const threads = new Map<string, Thread>();
let seq = 0;

export function getThread(userId: string): Thread {
  let thread = threads.get(userId);
  if (!thread) {
    seq += 1;
    thread = { id: `thread_${seq}`, userId, messages: [] };
    threads.set(userId, thread);
  }
  return thread;
}

export function appendMessage(userId: string, message: ThreadMessage): void {
  getThread(userId).messages.push(message);
}

export function getMessages(userId: string): ThreadMessage[] {
  return getThread(userId).messages;
}

export function resetThread(userId: string): void {
  threads.delete(userId);
}
