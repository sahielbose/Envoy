"use client";

import { useState } from "react";
import { Card, Toggle } from "@/components/ui";

/**
 * "Get discovered" presentation toggle. Off by default and revocable, the
 * share link only appears when explicitly enabled. This is a presentation tool,
 * not a marketplace (no auto-apply to the candidate).
 */
export function GetDiscovered({ handle }: { handle: string }) {
  const [on, setOn] = useState(false);

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
            <span style={{ flex: 1, fontSize: 13, color: "var(--ink-soft)" }}>
              app.envoy.so/p/{handle}
            </span>
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
