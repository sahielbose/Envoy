import type { ReactNode } from "react";

/** Standard in-content page heading: title + optional subtitle and actions. */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="app__top-actions">{actions}</div> : null}
    </div>
  );
}
