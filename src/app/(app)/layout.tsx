import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SessionProvider } from "@/components/app/session-provider";
import { Sidebar } from "@/components/app/sidebar";
import { TopBar } from "@/components/app/top-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Mock-first: getSession always returns a demo user. The gate is real for the
  // Phase 20 Auth.js adapter, which returns null for signed-out visitors.
  if (!session) {
    redirect("/");
  }

  return (
    <SessionProvider session={session}>
      <div className="app">
        <Sidebar />
        <div className="app__main">
          <TopBar />
          <div className="app__content">{children}</div>
        </div>
      </div>
    </SessionProvider>
  );
}
