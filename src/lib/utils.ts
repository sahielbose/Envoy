import { clsx, type ClassValue } from "clsx";

/** Conditional className join. Thin wrapper over clsx for the design system. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
