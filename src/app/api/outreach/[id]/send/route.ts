import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { getEmailSender } from "@/server/email/sender";

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
  const repos = getRepositories();
  const record = await repos.outreach.findById(id);
  if (!record || record.userId !== session.user.id) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  if (record.status !== "approved") {
    return Response.json({ error: "Approve this draft before sending." }, { status: 403 });
  }

  const settings = await repos.settings.findByUserId(session.user.id);
  if (!settings?.gmailConnected) {
    return Response.json({ error: "Connect Gmail in settings to send." }, { status: 403 });
  }

  const drafts = Array.isArray(record.drafts) ? record.drafts : [];
  const draft = drafts[parsed.data.draftIndex] as { subject?: string; body: string } | undefined;
  if (!draft) return Response.json({ error: "Draft not found." }, { status: 400 });

  const result = await getEmailSender().send({
    to: parsed.data.to,
    subject: draft.subject,
    body: draft.body,
  });
  await repos.outreach.update(id, {
    status: "sent",
    sentVia: result.sentVia,
    sentAt: result.sentAt,
  });

  return Response.json({ id, status: "sent", sentVia: result.sentVia });
}
