import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { getEmailSender } from "@/server/email/sender";
import { sendOutreach } from "@/server/email/send-outreach";

export const runtime = "nodejs";

// The recipient is user-provided (Envoy never harvests contacts), and confirm
// must be explicitly true — per-message approval.
const Body = z.object({
  draftIndex: z.number().int().min(0),
  to: z.string().email(),
  confirm: z.literal(true),
});

/**
 * The ONLY send path in the app. Every gate must pass: the draft is approved,
 * Gmail is connected (opt-in flag), a recipient is provided, and the user
 * explicitly confirmed this message.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "A recipient email and explicit confirmation are required." },
      { status: 400 },
    );
  }

  const { id } = await params;
  const result = await sendOutreach(getRepositories(), getEmailSender(), {
    userId: session.user.id,
    outreachId: id,
    draftIndex: parsed.data.draftIndex,
    to: parsed.data.to,
    confirm: parsed.data.confirm,
  });
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ id, status: "sent", sentVia: result.sentVia });
}
