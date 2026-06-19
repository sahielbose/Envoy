import { env, requireProvider } from "@/lib/env";
import type { EmailSender, SendInput, SendResult } from "./sender";

const FROM = process.env.EMAIL_FROM ?? "Envoy <outreach@envoy.so>";

/**
 * Real approved-message sender — Resend. A per-user Gmail OAuth sender can plug
 * in behind this same EmailSender interface (optional). Sending still happens
 * only through the gated, per-message approval path (sendOutreach).
 */
export class ResendSender implements EmailSender {
  constructor() {
    requireProvider("email");
  }

  async send(input: SendInput): Promise<SendResult> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: input.to,
        subject: input.subject ?? "(no subject)",
        text: input.body,
      }),
    });
    if (!res.ok) throw new Error(`Resend send failed: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as { id: string };
    return { sentVia: "resend", sentAt: new Date(), messageId: data.id };
  }
}
