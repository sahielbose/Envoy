"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Icon, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface OutreachDraftItem {
  tone: string;
  subject?: string;
  body: string;
}
export interface OutreachItem {
  id: string;
  jobId: string;
  status: string;
  channel: string;
  jobLabel: string;
  targetLabel: string;
  drafts: OutreachDraftItem[];
}
export interface RoleOption {
  jobId: string;
  label: string;
}

function mailto(draft: OutreachDraftItem): string {
  const params = new URLSearchParams();
  if (draft.subject) params.set("subject", draft.subject);
  params.set("body", draft.body);
  return `mailto:?${params.toString()}`;
}

function DraftCard({
  item,
  onRegenerate,
  onApprove,
}: {
  item: OutreachItem;
  onRegenerate: (jobId: string) => void;
  onApprove: (id: string) => void;
}) {
  const [toneIndex, setToneIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const draft = item.drafts[toneIndex] ?? item.drafts[0];

  async function approveAndCopy() {
    const text = `${draft.subject ? `Subject: ${draft.subject}\n\n` : ""}${draft.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
    // Record approval intent. This never sends.
    onApprove(item.id);
  }

  return (
    <div className="draft">
      <div className="draft__top">
        <div className="tones">
          {item.drafts.map((d, i) => (
            <button
              key={d.tone}
              type="button"
              className={cn("tone", i === toneIndex && "is-active")}
              onClick={() => setToneIndex(i)}
            >
              {d.tone}
            </button>
          ))}
        </div>
        <span className="panel__meta">
          {item.jobLabel}
          {item.status === "approved" ? " · approved" : ""}
        </span>
      </div>
      <div className="draft__field">
        <span>To</span>
        {item.targetLabel}
      </div>
      {draft.subject ? (
        <div className="draft__field">
          <span>Subject</span>
          {draft.subject}
        </div>
      ) : null}
      <div className="draft__body">{draft.body}</div>
      <div className="draft__actions">
        <button type="button" className="btn" onClick={approveAndCopy}>
          {copied ? "Copied" : "Approve & copy"}
        </button>
        <a className="btn btn--ghost" href={mailto(draft)}>
          Open in mail
        </a>
        <button type="button" className="btn btn--ghost" onClick={() => onRegenerate(item.jobId)}>
          Regenerate
        </button>
      </div>
    </div>
  );
}

export function OutreachQueue({
  items,
  options,
}: {
  items: OutreachItem[];
  options: RoleOption[];
}) {
  const router = useRouter();
  const [jobId, setJobId] = useState(options[0]?.jobId ?? "");
  const [busy, setBusy] = useState(false);

  async function draftFor(forJobId: string) {
    if (!forJobId) return;
    setBusy(true);
    try {
      await fetch("/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: forJobId }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function approve(id: string) {
    await fetch(`/api/outreach/${id}/approve`, { method: "POST" });
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 760 }}>
      {options.length > 0 ? (
        <div className="studio__bar">
          <div className="field">
            <label htmlFor="draft-role">Draft outreach for</label>
            <select
              id="draft-role"
              className="select"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            >
              {options.map((o) => (
                <option key={o.jobId} value={o.jobId}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => draftFor(jobId)} disabled={busy || !jobId}>
            {busy ? "Drafting…" : "Draft outreach"}
          </Button>
        </div>
      ) : null}

      <div className="note" style={{ marginBottom: 14 }}>
        <Icon icon={Shield} size={13} />
        Envoy never sends anything without your approval. Copy or open in mail are the defaults.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((item) => (
          <DraftCard key={item.id} item={item} onRegenerate={draftFor} onApprove={approve} />
        ))}
      </div>
    </div>
  );
}
