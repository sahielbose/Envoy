"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  FileText,
  BookOpen,
  Mail,
  Columns3,
  User,
  Settings,
} from "lucide-react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export const APP_NAV: { href: Route; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard" as Route, label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat" as Route, label: "Chat", icon: MessageSquare },
  { href: "/matches" as Route, label: "Matches", icon: Sparkles },
  { href: "/resume" as Route, label: "Résumé", icon: FileText },
  { href: "/research" as Route, label: "Research", icon: BookOpen },
  { href: "/outreach" as Route, label: "Outreach", icon: Mail },
  { href: "/tracker" as Route, label: "Tracker", icon: Columns3 },
  { href: "/profile" as Route, label: "Profile", icon: User },
  { href: "/settings" as Route, label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app__side">
      <div className="app__brand">Envoy</div>
      <nav className="app__nav" aria-label="App navigation">
        {APP_NAV.map((n) => {
          const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn("app__navlink", active && "is-active")}
              aria-current={active ? "page" : undefined}
            >
              <Icon icon={n.icon} size={17} />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="app__side-foot">Mock session · demo data</div>
    </aside>
  );
}
