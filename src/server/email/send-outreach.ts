import type { Repositories } from "@/server/repositories";
import type { EmailSender } from "./sender";

export interface SendOutreachInput {
  userId: string;
  outreachId: string;
  draftIndex: number;
  to: string;
  confirm: boolean;
}

export interface SendOutreachResult {
  ok: boolean;
  status: number;
  error?: string;
  sentVia?: string;
}

/**
 * The single send gate. Sending requires, in order: explicit confirmation, an
 * owned outreach record, an APPROVED status, Gmail connected (opt-in), a
 * user-provided recipient, and a valid draft. Any failure returns without
 * calling the sender — so nothing transmits without explicit approval.
 */
export async function sendOutreach(
  repos: Repositories,
  sender: EmailSender,
  input: SendOutreachInput,
): Promise<SendOutreachResult> {
  if (input.confirm !== true) {
    return { ok: false, status: 400, error: "Explicit confirmation is required." };
  }
  const record = await repos.outreach.findById(input.outreachId);
  if (!record || record.userId !== input.userId) {
    return { ok: false, status: 404, error: "Not found." };
  }
  if (record.status !== "approved") {
    return { ok: false, status: 403, error: "Approve this draft before sending." };
  }
  const settings = await repos.settings.findByUserId(input.userId);
  if (!settings?.gmailConnected) {
    return { ok: false, status: 403, error: "Connect Gmail in settings to send." };
  }
  const drafts = Array.isArray(record.drafts) ? record.drafts : [];
  const draft = drafts[input.draftIndex] as { subject?: string; body: string } | undefined;
  if (!draft) {
    return { ok: false, status: 400, error: "Draft not found." };
  }

  const result = await sender.send({ to: input.to, subject: draft.subject, body: draft.body });
  await repos.outreach.update(input.outreachId, {
    status: "sent",
    sentVia: result.sentVia,
    sentAt: result.sentAt,
  });
  return { ok: true, status: 200, sentVia: result.sentVia };
}
