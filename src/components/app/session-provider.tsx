"use client";

import { createContext, useContext } from "react";
import type { Session } from "@/lib/auth/session";

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

/** Access the current (mock) session from client components. */
export function useSession(): Session | null {
  return useContext(SessionContext);
}
