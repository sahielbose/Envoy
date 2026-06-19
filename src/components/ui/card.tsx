import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Generic surface card. */
export function Card({ className, children, ...rest }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("card", className)} {...rest}>
      {children}
    </div>
  );
}
