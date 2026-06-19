"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import type { Dossier, Interviewer, SourceRef } from "@/lib/domain";

export interface ResearchOption {
  company: string;
  jobId?: string;
  label: string;
}

interface ResearchResult {
  dossier: Dossier;
  likelyQuestions: string[];
  questionsToAsk: string[];
  sources: SourceRef[];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <h3>{title}</h3>
      {children}
    </Card>
  );
}

function People({ people }: { people: Interviewer[] }) {
  return (
    <div className="people">
      {people.map((p, i) => (
        <div className="person" key={i}>
          <b>{p.role}</b>
          <small>
            {p.archetype}
            {p.focus ? ` · ${p.focus}` : ""}
          </small>
        </div>
      ))}
    </div>
  );
}

export function ResearchView({ options }: { options: ResearchOption[] }) {
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function research() {
    const opt = options[index];
    if (!opt) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: opt.company, jobId: opt.jobId }),
      });
      if (!res.ok) throw new Error("research failed");
      setResult((await res.json()) as ResearchResult);
    } catch {
      setError("Couldn't build that dossier. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="studio__bar">
        <div className="field">
          <label htmlFor="company">Research</label>
          <select
            id="company"
            className="select"
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
          >
            {options.map((o, i) => (
              <option key={`${o.company}-${i}`} value={i}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={research} disabled={busy}>
          {busy ? "Researching…" : "Build dossier"}
        </Button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {result ? (
        <div className="dossier">
          <Section title={`${result.dossier.company}, overview`}>
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
              {result.dossier.overview}
            </p>
            {result.dossier.signals.length > 0 ? (
              <ul>
                {result.dossier.signals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : null}
          </Section>

          <Section title="Who you'll talk to">
            <People people={result.dossier.people} />
          </Section>

          <Section title="Likely questions">
            <ul>
              {result.likelyQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </Section>

          <Section title="Smart questions to ask">
            <ul>
              {result.questionsToAsk.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </Section>

          <Section title="Sources">
            <div className="sources">
              {result.sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
              ))}
            </div>
            <p className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
              Built from public web sources only, never harvested private contact info.
            </p>
          </Section>
        </div>
      ) : null}
    </div>
  );
}
