import { shouldMock } from "@/lib/env";
import { ResendSender } from "./resend";

export interface SendInput {
  to: string;
  subject?: string;
  body: string;
}

export interface SendResult {
  sentVia: string;
  sentAt: Date;
  messageId: string;
}

/** Approved-message sender. Mock = stub (no transmit); Phase 20 = Gmail/Resend. */
export interface EmailSender {
  send(input: SendInput): Promise<SendResult>;
}

class StubGmailSender implements EmailSender {
  private seq = 0;
  async send(_input: SendInput): Promise<SendResult> {
    this.seq += 1;
    // Stub: records a send, does NOT actually transmit. Real Gmail OAuth send is
    // wired in Phase 20 behind the same interface.
    return {
      sentVia: "gmail",
      sentAt: new Date("2026-06-01T00:00:00.000Z"),
      messageId: `stub_${this.seq.toString().padStart(4, "0")}`,
    };
  }
}

let cached: EmailSender | null = null;

export function getEmailSender(): EmailSender {
  if (!cached) {
    cached = shouldMock("email") ? new StubGmailSender() : new ResendSender();
  }
  return cached;
}
