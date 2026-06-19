import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type ArtVariant = "violet" | "amber" | "sage" | "rose" | "nebula";

interface GradientArtProps extends ComponentPropsWithoutRef<"div"> {
  variant: ArtVariant;
  /** Apply the SVG film-grain overlay (default true). */
  grain?: boolean;
}

/**
 * Dreamy gradient "art" block — Envoy's stand-in for photography. Decorative by
 * default (aria-hidden). Mirrors the .art / .art--* recipes in landing.html.
 */
export function GradientArt({
  variant,
  grain = true,
  className,
  ...rest
}: GradientArtProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("art", `art--${variant}`, grain && "grain", className)}
      {...rest}
    />
  );
}
