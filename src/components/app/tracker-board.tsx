"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STAGES, STAGE_LABELS, STAGE_DOT } from "@/server/tracker/stages";
import type { ApplicationStage } from "@/lib/domain";
import { cn } from "@/lib/utils";

export interface TrackerItem {
  id: string;
  stage: string;
  company: string;
  role: string;
  jobId: string;
  notes: string | null;
  nextAction: { label: string; due?: string } | null;
  resumeAttached: boolean;
}

function TrackerCard({ item }: { item: TrackerItem }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [naLabel, setNaLabel] = useState(item.nextAction?.label ?? "");
  const [naDue, setNaDue] = useState(item.nextAction?.due ?? "");
  const stage = item.stage as ApplicationStage;

  async function update(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/applications/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const nextAction = naLabel.trim()
      ? { label: naLabel.trim(), ...(naDue.trim() ? { due: naDue.trim() } : {}) }
      : undefined;
    await update({ notes: notes.trim() || null, ...(nextAction ? { nextAction } : {}) });
    setEditing(false);
  }

  async function attach() {
    setBusy(true);
    try {
      await fetch(`/api/applications/${item.id}/attach-resume`, { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tcard">
      <b>{item.company}</b>
      <small>
        <span className="dot" style={{ background: STAGE_DOT[stage] ?? "#a89e8d" }} />
        {item.role}
      </small>
      {item.nextAction ? (
        <div className="na">
          <b>Next:</b> {item.nextAction.label}
          {item.nextAction.due ? ` · ${item.nextAction.due}` : ""}
        </div>
      ) : null}
      {item.resumeAttached ? (
        <div className="na">
          <b>Résumé:</b> attached
        </div>
      ) : null}

      <select
        className="stage-select"
        aria-label={`Move ${item.company} to a stage`}
        value={stage}
        disabled={busy}
        onChange={(e) => update({ stage: e.target.value })}
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>
            {STAGE_LABELS[s]}
          </option>
        ))}
      </select>

      {editing ? (
        <div className="tcard__edit">
          <textarea
            aria-label="Notes"
            placeholder="Notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <input
            aria-label="Next action"
            placeholder="Next action"
            value={naLabel}
            onChange={(e) => setNaLabel(e.target.value)}
          />
          <input
            aria-label="Due"
            placeholder="Due (e.g. 2026-06-10)"
            value={naDue}
            onChange={(e) => setNaDue(e.target.value)}
          />
          <div className="tcard__row">
            <button type="button" className="tcard__btn" disabled={busy} onClick={save}>
              Save
            </button>
            <button
              type="button"
              className="tcard__btn tcard__btn--ghost"
              disabled={busy}
              onClick={attach}
            >
              {item.resumeAttached ? "Re-tailor résumé" : "Tailor & attach résumé"}
            </button>
            <button
              type="button"
              className="tcard__btn tcard__btn--ghost"
              onClick={() => setEditing(false)}
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="tcard__link" onClick={() => setEditing(true)}>
          Notes &amp; next action
        </button>
      )}
    </div>
  );
}

export function TrackerBoard({ items }: { items: TrackerItem[] }) {
  const [view, setView] = useState<"board" | "table">("board");

  return (
    <div>
      <div className="tracker-toolbar">
        <button
          type="button"
          className={cn("tab-btn", view === "board" && "is-active")}
          onClick={() => setView("board")}
        >
          Board
        </button>
        <button
          type="button"
          className={cn("tab-btn", view === "table" && "is-active")}
          onClick={() => setView("table")}
        >
          Table
        </button>
      </div>

      {view === "board" ? (
        <div className="tboard">
          {STAGES.map((s) => {
            const col = items.filter((i) => i.stage === s);
            return (
              <div key={s}>
                <div className="tcol__h">
                  {STAGE_LABELS[s]} <em>{col.length}</em>
                </div>
                {col.map((it) => (
                  <TrackerCard key={it.id} item={it} />
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <table className="ttable">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Stage</th>
              <th>Next action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const stage = it.stage as ApplicationStage;
              return (
                <tr key={it.id}>
                  <td>
                    <b>{it.company}</b>
                  </td>
                  <td>{it.role}</td>
                  <td>
                    <span className="stage-badge">
                      <span className="dot" style={{ background: STAGE_DOT[stage] ?? "#a89e8d" }} />
                      {STAGE_LABELS[stage] ?? it.stage}
                    </span>
                  </td>
                  <td>
                    {it.nextAction
                      ? `${it.nextAction.label}${it.nextAction.due ? ` · ${it.nextAction.due}` : ""}`
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
