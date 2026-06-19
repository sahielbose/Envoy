"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ResumeChange } from "@/lib/domain";

export interface RoleOption {
  jobId: string;
  label: string;
}

interface TailorResponse {
  resumeDocId: string;
  coverLetterDocId: string;
  diffSummary: string;
  changes: ResumeChange[];
  resumeText: string;
  coverText: string;
}

type Tab = "diff" | "resume" | "cover";

function DiffView({ changes }: { changes: ResumeChange[] }) {
  return (
    <div className="diff">
      {changes.map((c, i) => (
        <div className="diff__row" key={`${c.section}-${i}`}>
          <div className="diff__sec">{c.section}</div>
          {c.before !== c.after ? (
            <>
              <div className="diff__before">{c.before}</div>
              <div className="diff__after">{c.after}</div>
            </>
          ) : (
            <div className="diff__same">Kept verbatim — {c.after}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ResumeStudio({ options }: { options: RoleOption[] }) {
  const [jobId, setJobId] = useState(options[0]?.jobId ?? "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [tab, setTab] = useState<Tab>("diff");
  const [error, setError] = useState<string | null>(null);

  async function tailor() {
    if (!jobId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/resume/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error("tailor failed");
      setResult((await res.json()) as TailorResponse);
      setTab("diff");
    } catch {
      setError("Couldn't tailor your résumé. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="studio__bar">
        <div className="field">
          <label htmlFor="role">Tailor for</label>
          <select
            id="role"
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
        <Button onClick={tailor} disabled={busy || !jobId}>
          {busy ? "Tailoring…" : "Tailor for this role"}
        </Button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {result ? (
        <>
          <div className="truthful-note">
            <Icon icon={ShieldCheck} size={14} />
            Envoy only rewords what&apos;s true — every line traces to your base résumé. It never
            invents employers, titles, dates, or skills.
          </div>
          <p className="muted" style={{ fontSize: 13.5, marginBottom: 14 }}>
            {result.diffSummary}
          </p>
          <div className="tabs">
            {(["diff", "resume", "cover"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                className={cn("tab-btn", tab === t && "is-active")}
                onClick={() => setTab(t)}
              >
                {t === "diff" ? "What changed" : t === "resume" ? "Résumé" : "Cover letter"}
              </button>
            ))}
          </div>
          {tab === "diff" ? <DiffView changes={result.changes} /> : null}
          {tab === "resume" ? <div className="doc">{result.resumeText}</div> : null}
          {tab === "cover" ? <div className="doc">{result.coverText}</div> : null}
        </>
      ) : null}
    </div>
  );
}
