"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface MatchItem {
  matchId: string;
  status: string;
  score: number;
  reasoning: string;
  gaps: string[];
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  url: string;
}

const PALETTE = [
  { a: "#8a7fc0", b: "#b9a9e6", accent: "#8a7fc0" },
  { a: "#d99f55", b: "#efce86", accent: "#d99f55" },
  { a: "#7c9a8e", b: "#a7c0b3", accent: "#7c9a8e" },
  { a: "#c98f86", b: "#e0a6a0", accent: "#c98f86" },
  { a: "#9aab6f", b: "#bcc89a", accent: "#9aab6f" },
];

function accentFor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function MatchesList({ items }: { items: MatchItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(matchId: string, status: "saved" | "dismissed") {
    setBusy(matchId);
    try {
      await fetch(`/api/matches/${matchId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      {items.map((it) => {
        const color = accentFor(it.company);
        const pct = Math.round(it.score * 100);
        return (
          <div className={cn("role", it.status === "saved" && "is-saved")} key={it.matchId}>
            <div
              className="role__logo"
              style={{ background: `linear-gradient(135deg, ${color.a}, ${color.b})` }}
            >
              {it.company.charAt(0)}
            </div>
            <div className="role__body">
              <div className="role__title">{it.title}</div>
              <div className="role__sub">
                {it.company}
                {it.location ? ` · ${it.location}` : ""}
              </div>
              <div className="role__why">{it.reasoning}</div>
              {it.gaps.length > 0 ? (
                <div className="role__gaps">
                  <b>Gaps:</b> {it.gaps.join(" ")}
                </div>
              ) : null}
              <div className="role__tags">
                {it.remote ? <span className="tag">Remote</span> : null}
                <span className="tag">{it.company}</span>
              </div>
              <div className="role__actions">
                {it.status === "saved" ? (
                  <button type="button" className="btn btn--ghost" disabled>
                    Saved
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn"
                    disabled={busy === it.matchId}
                    onClick={() => setStatus(it.matchId, "saved")}
                  >
                    Save
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={busy === it.matchId}
                  onClick={() => setStatus(it.matchId, "dismissed")}
                >
                  Dismiss
                </button>
                <a className="btn btn--ghost" href={it.url} target="_blank" rel="noreferrer">
                  View role
                </a>
              </div>
            </div>
            <div className="ringwrap">
              <div
                className="ring"
                style={{ "--p": pct, "--ringc": color.accent } as React.CSSProperties}
              >
                <b>{pct}</b>
              </div>
              <small>match</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}
