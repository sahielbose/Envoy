import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getServices } from "@/server/services";
import { PreferencesSchema, ProfileStructuredSchema } from "@/lib/domain";

export const runtime = "nodejs";

// userId comes from the session, never the client (PII / ownership).
const Body = z.object({
  structured: ProfileStructuredSchema,
  preferences: PreferencesSchema,
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
  }
  const result = await getServices().buildProfile({
    userId: session.user.id,
    structured: parsed.data.structured,
    preferences: parsed.data.preferences,
  });
  return NextResponse.json(result);
}
