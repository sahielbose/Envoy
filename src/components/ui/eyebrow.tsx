import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Soft surface pill used as a section label. */
export function Eyebrow({ className, children, ...rest }: ComponentPropsWithoutRef<"span">) {
  return (
    <span className={cn("eyebrow", className)} {...rest}>
      {children}
    </span>
  );
}
