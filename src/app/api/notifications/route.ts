import { getSession } from "@/lib/auth/session";
import { getNotifications } from "@/server/jobs/notifications";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ notifications: [] });
  return Response.json({ notifications: getNotifications(session.user.id) });
}
