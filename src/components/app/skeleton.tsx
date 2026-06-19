import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Shimmer placeholder. Animation is disabled under prefers-reduced-motion. */
export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn("skeleton", className)} style={style} aria-hidden="true" />;
}
