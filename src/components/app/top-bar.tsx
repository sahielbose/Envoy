"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Icon } from "@/components/ui";
import { useSession } from "./session-provider";
import { APP_NAV } from "./sidebar";

/** App top bar: route title + notifications and account-menu stubs. */
export function TopBar() {
  const pathname = usePathname();
  const session = useSession();
  const current = APP_NAV.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  const title = current?.label ?? "Envoy";
  const name = session?.user.name ?? "You";

  return (
    <header className="app__top">
      <div className="app__top-title">{title}</div>
      <div className="app__top-actions">
        <button type="button" className="iconbtn" aria-label="Notifications">
          <Icon icon={Bell} size={18} />
          <span className="badge" aria-hidden="true" />
        </button>
        <button type="button" className="usermenu" aria-label="Account menu">
          <span className="av" aria-hidden="true" />
          <small>{name}</small>
        </button>
      </div>
    </header>
  );
}
