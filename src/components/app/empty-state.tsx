import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui";

/** Directive empty state: icon + title + description + optional action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      {icon ? (
        <span className="empty__icon">
          <Icon icon={icon} size={22} />
        </span>
      ) : null}
      <h3 className="empty__title">{title}</h3>
      {description ? <p className="empty__desc">{description}</p> : null}
      {action ? <div className="empty__action">{action}</div> : null}
    </div>
  );
}
