import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Skill/attribute tag on cards (canvas background). */
export function Tag({ className, children, ...rest }: ComponentPropsWithoutRef<"span">) {
  return (
    <span className={cn("tag", className)} {...rest}>
      {children}
    </span>
  );
}
