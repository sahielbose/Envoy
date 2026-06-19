"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Icon } from "@/components/ui";
import { useSession } from "./session-provider";
import { APP_NAV } from "./sidebar";

interface Note {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
}

/** App top bar: route title + notification center and account-menu stubs. */
export function TopBar() {
  const pathname = usePathname();
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok && active) {
          const data = (await res.json()) as { notifications: Note[] };
          setNotes(data.notifications ?? []);
        }
      } catch {
        /* notifications unavailable */
      }
    })();
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = APP_NAV.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  const title = current?.label ?? "Envoy";
  const name = session?.user.name ?? "You";

  return (
    <header className="app__top">
      <div className="app__top-title">{title}</div>
      <div className="app__top-actions">
        <div className="notif" ref={ref}>
          <button
            type="button"
            className="iconbtn"
            aria-label="Notifications"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon icon={Bell} size={18} />
            {notes.length > 0 ? <span className="badge" aria-hidden="true" /> : null}
          </button>
          {open ? (
            <div className="notif__panel" role="menu">
              {notes.length === 0 ? (
                <div className="notif__empty">
                  No notifications yet. Envoy will nudge you about new matches, follow-ups, and
                  interviews.
                </div>
              ) : (
                notes.map((n) => (
                  <div className="notif__item" key={n.id}>
                    <b>{n.title}</b>
                    <p>{n.body}</p>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
        <button type="button" className="usermenu" aria-label="Account menu">
          <span className="av" aria-hidden="true" />
          <small>{name}</small>
        </button>
      </div>
    </header>
  );
}
