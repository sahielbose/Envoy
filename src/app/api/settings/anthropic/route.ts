import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { applyEnv } from "@/lib/server/env-file";
import { resetLLMProvider } from "@/lib/agent/llm";
import { resetServices } from "@/server/services";

export const runtime = "nodejs";

const DEFAULT_MODEL = "claude-opus-4-8";

function mask(key: string): string {
  const tail = key.slice(-4);
  return `sk-ant-…${tail}`;
}

function status() {
  const key = process.env.ANTHROPIC_API_KEY ?? "";
  return {
    connected: key.length > 0,
    hint: key.length > 0 ? mask(key) : null,
    model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
  };
}

/** Best-effort live check: returns "ok" | "rejected" | "unknown". Never throws. */
async function verifyKey(key: string): Promise<"ok" | "rejected" | "unknown"> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
      signal: controller.signal,
    });
    if (res.status === 401 || res.status === 403) return "rejected";
    if (res.ok) return "ok";
    return "unknown";
  } catch {
    return "unknown";
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return Response.json(status());
}

const Body = z.object({ key: z.string() });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "A key is required." }, { status: 400 });

  const key = parsed.data.key.trim();
  if (!key.startsWith("sk-ant-") || key.length < 24) {
    return Response.json(
      { error: "That doesn't look like an Anthropic API key (it should start with sk-ant-)." },
      { status: 400 },
    );
  }

  const verdict = await verifyKey(key);
  if (verdict === "rejected") {
    return Response.json({ error: "Anthropic rejected this key. Check it and try again." }, { status: 400 });
  }

  // Persist to .env.local and the running process, and flip the LLM off mock.
  applyEnv({ ANTHROPIC_API_KEY: key, MOCK_LLM: "false" });
  resetLLMProvider();
  resetServices();

  return Response.json({ ...status(), verified: verdict === "ok" });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  applyEnv({ ANTHROPIC_API_KEY: null, MOCK_LLM: null });
  resetLLMProvider();
  resetServices();

  return Response.json(status());
}
