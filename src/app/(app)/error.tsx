"use client";

import { AlertTriangle } from "lucide-react";
import { Icon } from "@/components/ui";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon icon={AlertTriangle} size={22} />
      </span>
      <h3 className="empty__title">Something went wrong</h3>
      <p className="empty__desc">That didn&apos;t load, it&apos;s on us. Try again in a moment.</p>
      <div className="empty__action">
        <button type="button" className="btn" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
