import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Centered max-width content well (1180px). */
export function Container({ className, children, ...rest }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("container", className)} {...rest}>
      {children}
    </div>
  );
}
