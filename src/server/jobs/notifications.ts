export interface Notification {
  id: string;
  userId: string;
  type: "match" | "approval" | "followup" | "interview";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

/** In-memory notification store (mock). Phase 20 backs it with a real store. */
const store = new Map<string, Notification[]>();
let seq = 0;

export function addNotification(
  userId: string,
  n: { type: Notification["type"]; title: string; body: string; createdAt?: string },
): Notification {
  seq += 1;
  const notification: Notification = {
    id: `n_${seq.toString().padStart(4, "0")}`,
    userId,
    type: n.type,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt ?? new Date("2026-06-01T00:00:00.000Z").toISOString(),
    read: false,
  };
  const list = store.get(userId) ?? [];
  list.unshift(notification);
  store.set(userId, list);
  return notification;
}

export function getNotifications(userId: string): Notification[] {
  return store.get(userId) ?? [];
}

export function clearNotifications(userId: string): void {
  store.delete(userId);
}
