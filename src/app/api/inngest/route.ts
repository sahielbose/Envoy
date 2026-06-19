import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { functions } from "@/inngest/functions";

/**
 * Inngest serve endpoint. Inngest Cloud registers and invokes the cron functions
 * (ingest, match-refresh, follow-up, interview reminders) through this route.
 * Signing/event keys are read from INNGEST_* env by the client.
 */
export const { GET, POST, PUT } = serve({ client: inngest, functions });
