"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { List, MessageSquare, Mail, Columns3, User, Lock } from "lucide-react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export type PreviewView = "matches" | "chat" | "outreach" | "tracker" | "profile";

const NAV: { id: PreviewView; label: string; icon: LucideIcon }[] = [
  { id: "matches", label: "Matches", icon: List },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "outreach", label: "Outreach", icon: Mail },
  { id: "tracker", label: "Tracker", icon: Columns3 },
  { id: "profile", label: "Profile", icon: User },
];

/**
 * Stubbed, clickable product window that replaces the marketing video. The
 * sidebar switches the main panel. All data is fictional ("Demo data").
 */
export function AppPreview() {
  const [view, setView] = useState<PreviewView>("matches");
  const active = NAV.find((n) => n.id === view);

  return (
    <div className="appwrap">
      <span className="preview-flag">Interactive preview</span>
      <div className="appwin">
        <div className="appwin__bar">
          <div className="dots">
            <span />
            <span />
            <span />
          </div>
          <div className="urlpill">
            <Icon icon={Lock} size={12} />
            app.envoy.so
          </div>
          <div className="me" />
        </div>
        <div className="appwin__body">
          <nav className="appnav" role="tablist" aria-label="Envoy app preview">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                role="tab"
                aria-selected={view === n.id}
                className={cn(view === n.id && "is-active")}
                onClick={() => setView(n.id)}
              >
                <Icon icon={n.icon} size={17} />
                {n.label}
              </button>
            ))}
            <span className="appnav__tag">Demo data</span>
          </nav>
          <div className="appmain">
            <section className="panel" role="tabpanel" aria-label={active?.label}>
              <div className="panel__head">
                <span className="panel__title">{active?.label}</span>
                <span className="panel__meta">demo</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
