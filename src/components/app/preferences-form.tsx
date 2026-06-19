"use client";

import { useState } from "react";
import { TagInput } from "./tag-input";
import { Button, Toggle } from "@/components/ui";
import type { Preferences, Seniority } from "@/lib/domain";

const SENIORITY: Seniority[] = [
  "intern",
  "junior",
  "mid",
  "senior",
  "staff",
  "lead",
  "principal",
  "director",
  "exec",
];

const EMPTY: Preferences = {
  titles: [],
  seniority: undefined,
  locations: [],
  remote: false,
  minComp: undefined,
  workAuth: undefined,
  stages: [],
  mustHaves: [],
  dealbreakers: [],
};

export function PreferencesForm({
  initial,
  onSubmit,
  submitting,
  submitLabel = "Save preferences",
}: {
  initial?: Partial<Preferences>;
  onSubmit: (prefs: Preferences) => void;
  submitting?: boolean;
  submitLabel?: string;
}) {
  const [prefs, setPrefs] = useState<Preferences>({ ...EMPTY, ...initial });
  const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  return (
    <form
      style={{ maxWidth: 720 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(prefs);
      }}
    >
      <div className="field">
        <label>Target titles</label>
        <p className="hint">The roles you want. Add a few.</p>
        <TagInput
          value={prefs.titles}
          onChange={(v) => set("titles", v)}
          ariaLabel="Target titles"
          placeholder="e.g. Senior Frontend Engineer"
        />
      </div>

      <div className="row-2">
        <div className="field">
          <label htmlFor="seniority">Seniority</label>
          <select
            id="seniority"
            className="select"
            value={prefs.seniority ?? ""}
            onChange={(e) => set("seniority", (e.target.value || undefined) as Seniority | undefined)}
          >
            <option value="">No preference</option>
            {SENIORITY.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="minComp">Minimum comp (USD)</label>
          <input
            id="minComp"
            className="input"
            type="number"
            inputMode="numeric"
            value={prefs.minComp ?? ""}
            onChange={(e) => set("minComp", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g. 160000"
          />
        </div>
      </div>

      <div className="field">
        <label>Locations</label>
        <TagInput
          value={prefs.locations}
          onChange={(v) => set("locations", v)}
          ariaLabel="Locations"
          placeholder="e.g. Remote, New York"
        />
      </div>

      <div className="field">
        <label htmlFor="workAuth">Work authorization</label>
        <input
          id="workAuth"
          className="input"
          value={prefs.workAuth ?? ""}
          onChange={(e) => set("workAuth", e.target.value || undefined)}
          placeholder="e.g. US citizen · needs sponsorship"
        />
        <p className="hint">A preference field — not legal or immigration advice.</p>
      </div>

      <div className="field">
        <label>Company stages</label>
        <TagInput
          value={prefs.stages}
          onChange={(v) => set("stages", v)}
          ariaLabel="Company stages"
          placeholder="e.g. Seed, Series A"
        />
      </div>

      <div className="row-2">
        <div className="field">
          <label>Must-haves</label>
          <TagInput
            value={prefs.mustHaves}
            onChange={(v) => set("mustHaves", v)}
            ariaLabel="Must-haves"
            placeholder="e.g. Remote-friendly"
          />
        </div>
        <div className="field">
          <label>Dealbreakers</label>
          <TagInput
            value={prefs.dealbreakers}
            onChange={(v) => set("dealbreakers", v)}
            ariaLabel="Dealbreakers"
            placeholder="e.g. On-site 5 days/week"
          />
        </div>
      </div>

      <div className="switch-row" style={{ marginBottom: 16 }}>
        <div>
          <b style={{ fontSize: 14 }}>Remote-friendly only</b>
          <small>Prioritize roles you can do remotely.</small>
        </div>
        <Toggle checked={prefs.remote} onChange={(v) => set("remote", v)} label="Remote-friendly only" />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
