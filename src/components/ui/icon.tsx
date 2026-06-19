import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconProps extends Omit<ComponentProps<LucideIcon>, "ref"> {
  icon: LucideIcon;
}

/**
 * Consistent lucide-react icon wrapper (default size 18, stroke 1.6) so icons
 * read uniformly across the app.
 */
export function Icon({ icon: LucideComp, size = 18, strokeWidth = 1.6, className, ...rest }: IconProps) {
  return <LucideComp size={size} strokeWidth={strokeWidth} className={cn("shrink-0", className)} {...rest} />;
}
