"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui";

export interface SettingsState {
  notifyEmail: boolean;
  cronMatchWeekly: boolean;
  cronFollowups: boolean;
  gmailConnected: boolean;
}

const ROWS: { key: keyof SettingsState; label: string; desc: string }[] = [
  { key: "notifyEmail", label: "Email notifications", desc: "Get nudges by email." },
  {
    key: "cronMatchWeekly",
    label: "Weekly match refresh",
    desc: "Envoy refreshes your matches every week and tells you what's new.",
  },
  {
    key: "cronFollowups",
    label: "Follow-up & interview reminders",
    desc: "Nudge me to follow up on applications and prep before interviews.",
  },
  {
    key: "gmailConnected",
    label: "Connect Gmail",
    desc: "Send approved outreach via your Gmail, opt-in, and only per message you confirm.",
  },
];

export function SettingsForm({ initial }: { initial: SettingsState }) {
  const [state, setState] = useState(initial);

  async function update(patch: Partial<SettingsState>) {
    setState((prev) => ({ ...prev, ...patch }));
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  return (
    <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 12 }}>
      {ROWS.map((r) => (
        <div className="switch-row" key={r.key}>
          <div>
            <b style={{ fontSize: 14 }}>{r.label}</b>
            <small>{r.desc}</small>
          </div>
          <Toggle
            checked={state[r.key]}
            onChange={(v) => update({ [r.key]: v } as Partial<SettingsState>)}
            label={r.label}
          />
        </div>
      ))}
    </div>
  );
}
