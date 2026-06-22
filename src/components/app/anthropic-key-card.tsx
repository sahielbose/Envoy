"use client";

import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Card, Icon } from "@/components/ui";

interface Status {
  connected: boolean;
  hint: string | null;
  model: string;
}

/**
 * Connect-your-own Claude key. Saving writes ANTHROPIC_API_KEY to .env.local and
 * flips the app's LLM off mock, so the chat copilot and résumé parsing run on
 * real Claude. The key is stored locally and never leaves this machine except in
 * calls to Anthropic; it is gitignored and never shown again in full.
 */
export function AnthropicKeyCard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/settings/anthropic");
        if (res.ok && active) setStatus((await res.json()) as Status);
      } catch {
        /* status unavailable */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = (await res.json()) as Status & { verified?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save the key.");
        return;
      }
      setStatus({ connected: data.connected, hint: data.hint, model: data.model });
      setVerified(data.verified ?? null);
      setKey("");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/anthropic", { method: "DELETE" });
      if (res.ok) {
        setStatus((await res.json()) as Status);
        setVerified(null);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="keycard__head">
        <span className="keycard__icon">
          <Icon icon={Sparkles} size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ fontSize: 14, display: "block" }}>Connect Claude</b>
          <small style={{ display: "block", marginTop: 2 }}>
            Add your Anthropic API key to run the chat copilot and résumé parsing on real Claude.
            Without a key, Envoy uses a built-in demo brain.
          </small>
        </div>
        {status?.connected ? (
          <span className="keycard__badge">
            <Icon icon={CheckCircle2} size={13} /> Connected
          </span>
        ) : null}
      </div>

      {status?.connected ? (
        <div className="keycard__connected">
          <div>
            <div className="ppv__label">Active key</div>
            <code>{status.hint}</code>
            <span className="keycard__model">model: {status.model}</span>
          </div>
          <button type="button" className="btn btn--ghost" onClick={disconnect} disabled={busy}>
            {busy ? "Removing…" : "Disconnect"}
          </button>
        </div>
      ) : (
        <div className="keycard__form">
          <input
            type="password"
            className="keycard__input"
            placeholder="sk-ant-..."
            aria-label="Anthropic API key"
            value={key}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && key.trim()) void save();
            }}
          />
          <button type="button" className="btn" onClick={save} disabled={busy || key.trim().length === 0}>
            {busy ? (
              <>
                <Icon icon={Loader2} size={14} /> Saving…
              </>
            ) : (
              "Save key"
            )}
          </button>
        </div>
      )}

      {error ? <p className="form-error">{error}</p> : null}
      {status?.connected && verified === false ? (
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          Saved. Couldn&apos;t verify against Anthropic just now, the chat will surface any auth
          error on first use.
        </p>
      ) : null}
      {status?.connected && verified === true ? (
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          Verified with Anthropic. Chat and résumé parsing now run on Claude.
        </p>
      ) : null}
      <p className="muted" style={{ fontSize: 11.5, marginTop: 10 }}>
        Stored in your local <code>.env.local</code> (gitignored), never committed and never shown
        again in full. Get a key at console.anthropic.com.
      </p>
    </Card>
  );
}
