import { getSession } from "@/lib/auth/session";
import { getMessages } from "@/server/chat/thread-store";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ messages: [] });
  return Response.json({ messages: getMessages(session.user.id) });
}
