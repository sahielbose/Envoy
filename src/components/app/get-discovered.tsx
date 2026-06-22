"use client";

import { useState } from "react";
import { Card, Toggle } from "@/components/ui";

/**
 * "Get discovered" presentation toggle. Off by default and revocable, the
 * share link only appears when explicitly enabled. The link resolves to a real
 * public profile page (/p/{handle}); this is a presentation tool, not a
 * marketplace (no auto-apply to the candidate).
 */
export function GetDiscovered({ handle }: { handle: string }) {
  const [on, setOn] = useState(false);
  const [copied, setCopied] = useState(false);

  const path = `/p/${handle}`;
  const display = `app.envoy.so/p/${handle}`;

  async function copy() {
    const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Card>
      <div className="switch-row" style={{ border: 0, padding: 0, background: "transparent" }}>
        <div>
          <b style={{ fontSize: 14 }}>Get discovered</b>
          <small>
            Let vetted teams reach out to you. Off by default, you stay in control and can turn it
            off anytime.
          </small>
        </div>
        <Toggle checked={on} onChange={setOn} label="Get discovered" />
      </div>

      {on ? (
        <div style={{ marginTop: 14 }}>
          <div className="ppv__label">Your share link</div>
          <div className="uploaded">
            <a
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, fontSize: 13, color: "var(--ink-soft)", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {display}
            </a>
            <button type="button" className="btn btn--ghost" onClick={copy}>
              {copied ? "Copied" : "Copy link"}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setOn(false)}>
              Turn off
            </button>
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            A presentation tool, not a marketplace, companies don&apos;t auto-apply to you, and your
            data is never sold or shared.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
