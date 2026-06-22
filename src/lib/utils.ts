import { clsx, type ClassValue } from "clsx";

/** Conditional className join. Thin wrapper over clsx for the design system. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** URL-safe slug from a display name, e.g. "Alex Rivera" -> "alex-rivera". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Join a list into prose with an Oxford "and": [a,b,c] -> "a, b, and c". */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
