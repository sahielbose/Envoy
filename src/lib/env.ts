import { z } from "zod";

/**
 * Coerce common truthy/falsy string env values to a boolean, defaulting when
 * the variable is unset or empty.
 */
const boolFromEnv = (defaultValue: boolean) =>
  z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return defaultValue;
      if (typeof v === "boolean") return v;
      return ["1", "true", "yes", "on"].includes(v.toLowerCase());
    });

/**
 * Envoy environment schema. Mock-first: the app runs with USE_MOCKS=true and
 * NO keys through Phases 1–19, so every provider secret is optional here. Real
 * adapters validate their own required keys when wired in Phase 20.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Master mock switch — keep true through Phases 1–19; flip per-provider in 20.
  USE_MOCKS: boolFromEnv(true),

  // Core (optional in mock mode; needed once a real DB/auth runs locally)
  DATABASE_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),

  // Phase 20 — providers wired behind the same interfaces, gated by env.
  ANTHROPIC_API_KEY: z.string().optional(),
  VOYAGE_API_KEY: z.string().optional(),
  EXA_API_KEY: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
  ADZUNA_APP_ID: z.string().optional(),
  ADZUNA_APP_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();

/**
 * External providers that have a mock now and a real adapter in Phase 20.
 * Each can override the master USE_MOCKS switch via MOCK_<PROVIDER>=true|false.
 */
export type MockableProvider =
  | "db"
  | "llm"
  | "embeddings"
  | "search"
  | "jobs"
  | "auth"
  | "storage"
  | "email"
  | "cron";

/**
 * Whether to use the mock implementation for a given provider. The master
 * USE_MOCKS flag applies unless a per-provider MOCK_<PROVIDER> override is set.
 * (Named `shouldMock`, not `useMocks`, so it is never mistaken for a React hook.)
 */
export function shouldMock(provider?: MockableProvider): boolean {
  if (provider) {
    const override = process.env[`MOCK_${provider.toUpperCase()}`];
    if (override !== undefined && override !== "") {
      return ["1", "true", "yes", "on"].includes(override.toLowerCase());
    }
  }
  return env.USE_MOCKS;
}

/** Env keys each provider's real (Phase 20) adapter requires. */
const REQUIRED_KEYS: Partial<Record<MockableProvider, (keyof Env)[]>> = {
  db: ["DATABASE_URL"],
  llm: ["ANTHROPIC_API_KEY"],
  embeddings: ["VOYAGE_API_KEY"],
  search: ["EXA_API_KEY"],
  auth: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "NEXTAUTH_SECRET"],
  storage: ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"],
  email: ["RESEND_API_KEY"],
};

/**
 * Validate that a provider's required secrets are present when it is NOT mocked.
 * Real adapters call this before constructing, so a misconfigured live provider
 * fails loudly instead of silently misbehaving.
 */
export function requireProvider(provider: MockableProvider): void {
  if (shouldMock(provider)) return;
  const missing = (REQUIRED_KEYS[provider] ?? []).filter((k) => !env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required env for "${provider}": ${missing.join(", ")}. ` +
        `Set them, or keep MOCK_${provider.toUpperCase()}=true / USE_MOCKS=true.`,
    );
  }
}
