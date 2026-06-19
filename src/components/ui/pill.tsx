import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Small rounded pill (meta chips, mini labels). */
export function Pill({ className, children, ...rest }: ComponentPropsWithoutRef<"span">) {
  return (
    <span className={cn("pill", className)} {...rest}>
      {children}
    </span>
  );
}
