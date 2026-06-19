"use client";

import { useState, type KeyboardEvent } from "react";

/** Chip-based multi-value input. Add with Enter/comma, remove with the ×. */
export function TagInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim().replace(/,$/, "").trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="taginput">
      {value.map((tag) => (
        <span className="chip" key={tag}>
          {tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))}>
            ×
          </button>
        </span>
      ))}
      <input
        aria-label={ariaLabel}
        placeholder={value.length === 0 ? placeholder : ""}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
      />
    </div>
  );
}
