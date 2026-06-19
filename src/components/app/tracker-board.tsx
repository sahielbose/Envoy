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

export function TrackerBoard({ items }: { items: TrackerItem[] }) {
  const router = useRouter();
  const [view, setView] = useState<"board" | "table">("board");
  const [busy, setBusy] = useState<string | null>(null);

  async function move(id: string, stage: ApplicationStage) {
    setBusy(id);
    try {
      await fetch(`/api/applications/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

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
          {STAGES.map((stage) => {
            const col = items.filter((i) => i.stage === stage);
            return (
              <div key={stage}>
                <div className="tcol__h">
                  {STAGE_LABELS[stage]} <em>{col.length}</em>
                </div>
                {col.map((it) => (
                  <div className="tcard" key={it.id}>
                    <b>{it.company}</b>
                    <small>
                      <span className="dot" style={{ background: STAGE_DOT[stage] }} />
                      {it.role}
                    </small>
                    {it.nextAction ? (
                      <div className="na">
                        <b>Next:</b> {it.nextAction.label}
                        {it.nextAction.due ? ` · ${it.nextAction.due}` : ""}
                      </div>
                    ) : null}
                    {it.resumeAttached ? (
                      <div className="na">
                        <b>Résumé:</b> attached
                      </div>
                    ) : null}
                    <select
                      className="stage-select"
                      aria-label={`Move ${it.company} to a stage`}
                      value={stage}
                      disabled={busy === it.id}
                      onChange={(e) => move(it.id, e.target.value as ApplicationStage)}
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {STAGE_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
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
                      : "—"}
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
