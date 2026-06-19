import Link from "next/link";
import type { ChatToolResult } from "./types";

function asRecord(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
}
function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function num(v: unknown): number {
  return typeof v === "number" ? v : 0;
}

function Matches({ output }: { output: unknown }) {
  const matches = Array.isArray(asRecord(output).matches) ? (asRecord(output).matches as unknown[]) : [];
  if (matches.length === 0) return null;
  return (
    <div className="toolres">
      {matches.slice(0, 4).map((m, i) => {
        const r = asRecord(m);
        const company = str(r.company);
        const title = str(r.title);
        const pct = Math.round(num(r.score) * 100);
        return (
          <div className="toolres__role" key={str(r.jobId) || i}>
            <div
              className="role__logo"
              style={{ background: "linear-gradient(135deg,#8a7fc0,#b9a9e6)" }}
            >
              {(company || "·").charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <b>{title || "Matched role"}</b>
              <small>{company || str(r.reasoning).slice(0, 60)}</small>
            </div>
            <span className="pct">{pct}%</span>
          </div>
        );
      })}
      <Link href="/matches" className="btn btn--ghost" style={{ alignSelf: "flex-start" }}>
        See all matches
      </Link>
    </div>
  );
}

function Draft({ output }: { output: unknown }) {
  const drafts = Array.isArray(asRecord(output).drafts) ? (asRecord(output).drafts as unknown[]) : [];
  const first = asRecord(drafts[0]);
  return (
    <div className="toolres">
      <div className="toolres__card">
        <b>Draft outreach</b>
        {str(first.subject) ? <div style={{ marginTop: 4 }}>Subject: {str(first.subject)}</div> : null}
        <div style={{ marginTop: 6 }}>{str(first.body).slice(0, 160)}…</div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--ink-faint)" }}>
          Draft only — nothing sends until you approve.
        </div>
      </div>
      <Link href="/outreach" className="btn btn--ghost" style={{ alignSelf: "flex-start" }}>
        Review &amp; approve
      </Link>
    </div>
  );
}

function Dossier({ output }: { output: unknown }) {
  const o = asRecord(output);
  const dossier = asRecord(o.dossier);
  const qs = Array.isArray(o.likelyQuestions) ? o.likelyQuestions.length : 0;
  return (
    <div className="toolres">
      <div className="toolres__card">
        <b>{str(dossier.company) || "Company"} dossier</b>
        <div style={{ marginTop: 6 }}>{str(dossier.overview).slice(0, 160)}</div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--ink-faint)" }}>
          {qs} likely questions · public sources only
        </div>
      </div>
      <Link href="/research" className="btn btn--ghost" style={{ alignSelf: "flex-start" }}>
        Open dossier
      </Link>
    </div>
  );
}

function Contacts({ output }: { output: unknown }) {
  const targets = Array.isArray(asRecord(output).targets) ? (asRecord(output).targets as unknown[]) : [];
  return (
    <div className="toolres">
      <div className="toolres__card">
        <b>Who to reach</b>
        <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
          {targets.slice(0, 3).map((t, i) => (
            <li key={i}>{str(asRecord(t).archetype)}</li>
          ))}
        </ul>
        <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--ink-faint)" }}>
          Roles + publicly-listed names only — never scraped contact info.
        </div>
      </div>
    </div>
  );
}

function Tailored({ output }: { output: unknown }) {
  const o = asRecord(output);
  return (
    <div className="toolres">
      <div className="toolres__card">
        <b>Tailored résumé + cover letter</b>
        <div style={{ marginTop: 6 }}>{str(o.diffSummary).slice(0, 160)}</div>
      </div>
      <Link href="/resume" className="btn btn--ghost" style={{ alignSelf: "flex-start" }}>
        Open in résumé studio
      </Link>
    </div>
  );
}

export function ToolResultView({ result }: { result: ChatToolResult }) {
  switch (result.tool) {
    case "find_roles":
      return <Matches output={result.output} />;
    case "draft_outreach":
      return <Draft output={result.output} />;
    case "research_company":
      return <Dossier output={result.output} />;
    case "map_contacts":
      return <Contacts output={result.output} />;
    case "tailor_resume":
      return <Tailored output={result.output} />;
    case "track_application":
      return (
        <div className="toolres">
          <div className="toolres__card">
            <b>Tracked</b>
            <div style={{ marginTop: 4 }}>Added to your pipeline.</div>
          </div>
        </div>
      );
    default:
      return null;
  }
}
