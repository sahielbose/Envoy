import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Vertical rhythm wrapper (clamped section padding). */
export function Section({ className, children, ...rest }: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={cn("section", className)} {...rest}>
      {children}
    </section>
  );
}
