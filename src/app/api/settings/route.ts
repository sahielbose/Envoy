import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";

export const runtime = "nodejs";

const Body = z.object({
  notifyEmail: z.boolean().optional(),
  cronMatchWeekly: z.boolean().optional(),
  cronFollowups: z.boolean().optional(),
  gmailConnected: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid settings." }, { status: 400 });

  const updated = await getRepositories().settings.upsert({
    userId: session.user.id,
    ...parsed.data,
  });
  return Response.json({
    notifyEmail: updated.notifyEmail,
    cronMatchWeekly: updated.cronMatchWeekly,
    cronFollowups: updated.cronFollowups,
    gmailConnected: updated.gmailConnected,
  });
}
