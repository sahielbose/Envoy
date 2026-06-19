import { describe, it, expect } from "vitest";
import { createServices } from "@/server/services";
import { createTestRepositories } from "@/server/repositories";
import { sendOutreach } from "./send-outreach";
import type { EmailSender, SendInput, SendResult } from "./sender";

class CountingSender implements EmailSender {
  calls: SendInput[] = [];
  async send(input: SendInput): Promise<SendResult> {
    this.calls.push(input);
    return { sentVia: "gmail", sentAt: new Date("2026-06-01T00:00:00.000Z"), messageId: "stub" };
  }
}

async function seedDraft(repositories: ReturnType<typeof createTestRepositories>["repositories"]) {
  return repositories.outreach.create({
    userId: "demo-user",
    jobId: "job-northwind-fe",
    target: { archetype: "Hiring manager", rationale: "Owns the role." },
    channel: "email",
    drafts: [{ tone: "warm", subject: "Hi", body: "Hello there." }],
    status: "draft",
  });
}

describe("draft_outreach is draft-only", () => {
  it("produces tone variants + rationale and never marks anything sent", async () => {
    const { repositories } = createTestRepositories();
    const out = await createServices({ repositories }).draftOutreach({
      profileId: "demo-profile",
      jobId: "job-northwind-fe",
      target: { archetype: "Hiring manager", rationale: "Owns the role." },
      channel: "email",
    });
    expect(out.drafts.map((d) => d.tone).sort()).toEqual(["brief", "direct", "warm"]);
    expect(out.rationale.length).toBeGreaterThan(0);
    expect(Object.keys(out).sort()).toEqual(["drafts", "rationale"]);

    const records = await repositories.outreach.listByUser("demo-user");
    expect(records.every((r) => r.status !== "sent")).toBe(true);
  });
});

describe("send gate — nothing sends without explicit approval", () => {
  it("blocks an unapproved draft (and never calls the sender)", async () => {
    const { repositories } = createTestRepositories();
    const sender = new CountingSender();
    const draft = await seedDraft(repositories);
    await repositories.settings.upsert({ userId: "demo-user", gmailConnected: true });

    const res = await sendOutreach(repositories, sender, {
      userId: "demo-user",
      outreachId: draft.id,
      draftIndex: 0,
      to: "person@example.com",
      confirm: true,
    });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(403);
    expect(sender.calls).toHaveLength(0);
    expect((await repositories.outreach.findById(draft.id))?.status).toBe("draft");
  });

  it("blocks when Gmail isn't connected, even if approved", async () => {
    const { repositories } = createTestRepositories();
    const sender = new CountingSender();
    const draft = await seedDraft(repositories);
    await repositories.outreach.update(draft.id, { status: "approved" });
    // demo-user settings: gmailConnected is false by default.

    const res = await sendOutreach(repositories, sender, {
      userId: "demo-user",
      outreachId: draft.id,
      draftIndex: 0,
      to: "person@example.com",
      confirm: true,
    });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(403);
    expect(sender.calls).toHaveLength(0);
  });

  it("blocks without explicit confirmation", async () => {
    const { repositories } = createTestRepositories();
    const sender = new CountingSender();
    const draft = await seedDraft(repositories);
    await repositories.outreach.update(draft.id, { status: "approved" });
    await repositories.settings.upsert({ userId: "demo-user", gmailConnected: true });

    const res = await sendOutreach(repositories, sender, {
      userId: "demo-user",
      outreachId: draft.id,
      draftIndex: 0,
      to: "person@example.com",
      confirm: false,
    });
    expect(res.ok).toBe(false);
    expect(sender.calls).toHaveLength(0);
  });

  it("sends only when approved + connected + confirmed", async () => {
    const { repositories } = createTestRepositories();
    const sender = new CountingSender();
    const draft = await seedDraft(repositories);
    await repositories.outreach.update(draft.id, { status: "approved" });
    await repositories.settings.upsert({ userId: "demo-user", gmailConnected: true });

    const res = await sendOutreach(repositories, sender, {
      userId: "demo-user",
      outreachId: draft.id,
      draftIndex: 0,
      to: "person@example.com",
      confirm: true,
    });
    expect(res.ok).toBe(true);
    expect(sender.calls).toHaveLength(1);
    expect((await repositories.outreach.findById(draft.id))?.status).toBe("sent");
  });
});
