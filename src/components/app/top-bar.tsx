"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, User, Settings, LogOut } from "lucide-react";
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

/** App top bar: route title + a notification center and a working account menu. */
export function TopBar() {
  const pathname = usePathname();
  const session = useSession();
  const [notifOpen, setNotifOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);

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

  // Close menus on outside click or Escape.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAcctOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setAcctOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close menus on navigation.
  useEffect(() => {
    setNotifOpen(false);
    setAcctOpen(false);
  }, [pathname]);

  const current = APP_NAV.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  const title = current?.label ?? "Envoy";
  const name = session?.user.name ?? "You";
  const email = session?.user.email ?? "";

  return (
    <header className="app__top">
      <div className="app__top-title">{title}</div>
      <div className="app__top-actions">
        <div className="notif" ref={notifRef}>
          <button
            type="button"
            className="iconbtn"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            aria-haspopup="menu"
            onClick={() => {
              setAcctOpen(false);
              setNotifOpen((o) => !o);
            }}
          >
            <Icon icon={Bell} size={18} />
            {notes.length > 0 ? <span className="badge" aria-hidden="true" /> : null}
          </button>
          {notifOpen ? (
            <div className="notif__panel" role="menu">
              {notes.length === 0 ? (
                <div className="notif__empty">
                  No notifications yet. Envoy will nudge you about new matches, follow-ups, and
                  interviews.
                </div>
              ) : (
                notes.map((n) => (
                  <div className="notif__item" key={n.id} role="menuitem">
                    <b>{n.title}</b>
                    <p>{n.body}</p>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="acct" ref={acctRef}>
          <button
            type="button"
            className="usermenu"
            aria-label="Account menu"
            aria-expanded={acctOpen}
            aria-haspopup="menu"
            onClick={() => {
              setNotifOpen(false);
              setAcctOpen((o) => !o);
            }}
          >
            <span className="av" aria-hidden="true" />
            <small>{name}</small>
          </button>
          {acctOpen ? (
            <div className="usermenu__panel" role="menu">
              <div className="usermenu__head">
                <b>{name}</b>
                {email ? <span>{email}</span> : null}
              </div>
              <Link href="/profile" className="usermenu__item" role="menuitem">
                <Icon icon={User} size={15} />
                Profile
              </Link>
              <Link href="/settings" className="usermenu__item" role="menuitem">
                <Icon icon={Settings} size={15} />
                Settings
              </Link>
              <Link href="/" className="usermenu__item usermenu__item--danger" role="menuitem">
                <Icon icon={LogOut} size={15} />
                Sign out
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
