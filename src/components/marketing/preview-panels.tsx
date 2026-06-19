"use client";

import { useState } from "react";
import { Send, Shield } from "lucide-react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

type Role = {
  letter: string;
  logo: string;
  title: string;
  sub: string;
  why: string;
  tags: string[];
  score: number;
  color: string;
};

const ROLES: Role[] = [
  {
    letter: "N",
    logo: "linear-gradient(135deg,#8a7fc0,#b9a9e6)",
    title: "Senior Frontend Engineer",
    sub: "Northwind · Remote · Seed",
    why: "Your React + design-systems work maps directly onto their new customer-facing platform.",
    tags: ["React", "TypeScript", "Remote"],
    score: 94,
    color: "#8a7fc0",
  },
  {
    letter: "L",
    logo: "linear-gradient(135deg,#d99f55,#efce86)",
    title: "Product Designer",
    sub: "Lumen · New York · Series A",
    why: "Scaling their design team — your fintech background is exactly what they're after.",
    tags: ["Figma", "Fintech", "Hybrid"],
    score: 89,
    color: "#d99f55",
  },
  {
    letter: "C",
    logo: "linear-gradient(135deg,#7c9a8e,#a7c0b3)",
    title: "Full-Stack Engineer",
    sub: "Cobalt Labs · Remote · Seed",
    why: "Small, TypeScript-heavy team — close to the shape of your last role.",
    tags: ["Node", "Postgres", "Remote"],
    score: 86,
    color: "#7c9a8e",
  },
];

function ScoreRing({ value, color }: { value: number; color: string }) {
  return (
    <div className="ringwrap">
      <div className="ring" style={{ "--p": value, "--ringc": color } as React.CSSProperties}>
        <b>{value}</b>
      </div>
      <small>match</small>
    </div>
  );
}

export function MatchesPanel() {
  return (
    <section className="panel" role="tabpanel" aria-label="Matches">
      <div className="panel__head">
        <span className="panel__title">12 new matches</span>
        <span className="panel__meta">ranked for you · this week</span>
      </div>
      {ROLES.map((r) => (
        <div className="role" key={r.title}>
          <div className="role__logo" style={{ background: r.logo }}>
            {r.letter}
          </div>
          <div className="role__body">
            <div className="role__title">{r.title}</div>
            <div className="role__sub">{r.sub}</div>
            <div className="role__why">{r.why}</div>
            <div className="role__tags">
              {r.tags.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <ScoreRing value={r.score} color={r.color} />
        </div>
      ))}
    </section>
  );
}

export function ChatPanel() {
  return (
    <section className="panel" role="tabpanel" aria-label="Chat">
      <div className="panel__head">
        <span className="panel__title">Chat with Envoy</span>
        <span className="panel__meta">your career copilot</span>
      </div>
      <div className="bubbles">
        <div className="bub bub--me">
          Find me senior frontend roles at seed-stage startups — remote is a plus.
        </div>
        <div className="bub bub--ai">
          Found 12 strong matches. Here are the top picks — all remote-friendly, Seed–Series A, and
          a close fit for your React + design-systems background:
          <div className="chips">
            <span className="chip">
              <i style={{ background: "#8a7fc0" }} />
              Northwind · 94%
            </span>
            <span className="chip">
              <i style={{ background: "#d99f55" }} />
              Lumen · 89%
            </span>
            <span className="chip">
              <i style={{ background: "#7c9a8e" }} />
              Cobalt · 86%
            </span>
          </div>
        </div>
        <div className="bub bub--ai">
          Want me to draft a warm intro to the hiring manager at Northwind? You&apos;ll approve it
          before anything sends.
        </div>
      </div>
      <div className="composer">
        <input placeholder="Message Envoy…" aria-label="Message Envoy (preview)" disabled />
        <span className="send">
          <Icon icon={Send} size={15} />
        </span>
      </div>
    </section>
  );
}

const TONES = ["Warm", "Direct", "Brief"] as const;

export function OutreachPanel() {
  const [tone, setTone] = useState<(typeof TONES)[number]>("Warm");
  return (
    <section className="panel" role="tabpanel" aria-label="Outreach">
      <div className="panel__head">
        <span className="panel__title">Draft · intro to Northwind</span>
        <span className="panel__meta">review before sending</span>
      </div>
      <div className="draft">
        <div className="draft__top">
          <div className="tones">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                className={cn("tone", tone === t && "is-active")}
                onClick={() => setTone(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <span className="panel__meta">sounds like you</span>
        </div>
        <div className="draft__field">
          <span>To</span>Priya — Engineering Manager, Northwind
        </div>
        <div className="draft__field">
          <span>Subject</span>Loved what Northwind is building
        </div>
        <div className="draft__body">
          Hi Priya — I came across Northwind&apos;s new customer platform and it&apos;s the kind of
          problem I&apos;d jump at. I&apos;ve spent the last three years building React design
          systems at scale, most recently shipping a component library used across a 40-person
          product org. Would you be open to a quick chat about the frontend role on your team? Happy
          to share a couple of things I&apos;d dig into first.
        </div>
        <div className="draft__actions">
          <button type="button" className="btn">
            Approve &amp; copy
          </button>
          <button type="button" className="btn btn--ghost">
            Regenerate
          </button>
        </div>
      </div>
      <div className="note">
        <Icon icon={Shield} size={13} />
        Envoy never sends anything without your approval.
      </div>
    </section>
  );
}

type TCard = { company: string; meta: string; dot: string };
const COLUMNS: { title: string; count: number; cards: TCard[] }[] = [
  {
    title: "Saved",
    count: 2,
    cards: [
      { company: "Cobalt Labs", meta: "Full-Stack Eng", dot: "#7c9a8e" },
      { company: "Fathom", meta: "Founding Eng", dot: "#c98f86" },
    ],
  },
  {
    title: "Outreach",
    count: 1,
    cards: [{ company: "Northwind", meta: "Sent 2d ago", dot: "#8a7fc0" }],
  },
  {
    title: "Interview",
    count: 1,
    cards: [{ company: "Lumen", meta: "Round 2 · Thu", dot: "#d99f55" }],
  },
  {
    title: "Offer",
    count: 1,
    cards: [{ company: "Drift House", meta: "Reviewing", dot: "#9aab6f" }],
  },
];

export function TrackerPanel() {
  return (
    <section className="panel" role="tabpanel" aria-label="Tracker">
      <div className="panel__head">
        <span className="panel__title">Your pipeline</span>
        <span className="panel__meta">5 active</span>
      </div>
      <div className="board">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="col__h">
              {col.title} <em>{col.count}</em>
            </div>
            {col.cards.map((c) => (
              <div className="tcard" key={c.company}>
                <b>{c.company}</b>
                <small>
                  <span className="dot" style={{ background: c.dot }} />
                  {c.meta}
                </small>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

const SKILLS = ["React", "TypeScript", "Design systems", "Accessibility", "0→1 product"];

export function ProfilePanel() {
  return (
    <section className="panel" role="tabpanel" aria-label="Profile">
      <div className="panel__head">
        <span className="panel__title">Your profile</span>
        <span className="panel__meta">built from your résumé</span>
      </div>
      <div className="prof">
        <div className="prof__av" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4>Senior Frontend Engineer</h4>
          <p>React · TypeScript · Design Systems · 6 yrs · Remote-first</p>
          <div className="skills">
            {SKILLS.map((s) => (
              <span className="skill" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="toggle">
        <div>
          <b style={{ fontSize: 14 }}>Get discovered</b>
          <small>Let vetted teams reach out to you. You stay in control.</small>
        </div>
        <span className="sw" />
      </div>
    </section>
  );
}
