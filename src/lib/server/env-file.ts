import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Absolute path to the project's .env.local (gitignored; never committed). */
export function envLocalPath(): string {
  return join(process.cwd(), ".env.local");
}

/**
 * Upsert keys in a dotenv file. A `null` value removes the key. Unrelated lines
 * and comments are preserved. Returns the new file contents. Pure given `path`,
 * so it's unit-testable with a temp file.
 */
export function applyEnvFile(updates: Record<string, string | null>, path = envLocalPath()): string {
  const original = existsSync(path) ? readFileSync(path, "utf8") : "";
  const lines = original.length > 0 ? original.split("\n") : [];
  const seen = new Set<string>();

  const out: string[] = [];
  for (const line of lines) {
    const m = /^\s*([A-Z0-9_]+)\s*=/.exec(line);
    const key = m?.[1];
    if (key && key in updates) {
      seen.add(key);
      const value = updates[key];
      if (value === null) continue; // drop the line entirely
      out.push(`${key}=${value}`);
    } else {
      out.push(line);
    }
  }

  // Append any keys that weren't already present.
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || seen.has(key)) continue;
    out.push(`${key}=${value}`);
  }

  const next = `${out.join("\n").replace(/\n+$/, "")}\n`;
  writeFileSync(path, next, { mode: 0o600 });
  return next;
}

/**
 * Apply env changes both to the running process (immediate effect) and to
 * .env.local (persists across restarts). A `null` value unsets/removes it.
 */
export function applyEnv(updates: Record<string, string | null>): void {
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) delete process.env[key];
    else process.env[key] = value;
  }
  applyEnvFile(updates);
}
