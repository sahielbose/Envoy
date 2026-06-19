import { shouldMock } from "@/lib/env";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Session {
  user: SessionUser;
}

/** Auth behind an interface, mock now, real Auth.js adapter in Phase 20. */
export interface AuthAdapter {
  getSession(): Promise<Session | null>;
}

const MOCK_USER: SessionUser = {
  id: "demo-user",
  name: "Alex Rivera",
  email: "alex@example.com",
};

class MockAuthAdapter implements AuthAdapter {
  async getSession(): Promise<Session | null> {
    return { user: MOCK_USER };
  }
}

let adapter: AuthAdapter | null = null;

function getAuthAdapter(): AuthAdapter {
  if (!adapter) {
    // Phase 20 swaps in a real Auth.js adapter when !useMocks("auth").
    adapter = new MockAuthAdapter();
  }
  return adapter;
}

/** Resolve the current session. Mock-first returns a fixed demo user. */
export async function getSession(): Promise<Session | null> {
  if (shouldMock("auth")) {
    return getAuthAdapter().getSession();
  }
  // Real Auth.js (loaded lazily so it isn't initialized in mock mode).
  const { auth } = await import("./nextauth");
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return {
    user: {
      id: email,
      name: session.user?.name ?? email,
      email,
      image: session.user?.image ?? undefined,
    },
  };
}
