import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";

export const runtime = "nodejs";

const Body = z.object({ jobId: z.string() });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "jobId is required." }, { status: 400 });

  const profile = await getRepositories().profiles.findByUserId(session.user.id);
  if (!profile) return Response.json({ error: "Complete onboarding first." }, { status: 400 });

  const services = getServices();
  const contacts = await services.mapContacts({ profileId: profile.id, jobId: parsed.data.jobId });
  const target = contacts.targets[0] ?? {
    archetype: "Hiring manager",
    rationale: "Owns the role and the decision.",
  };

  // Draft only — this never sends.
  await services.draftOutreach({
    profileId: profile.id,
    jobId: parsed.data.jobId,
    target,
    channel: "email",
  });

  return Response.json({ ok: true });
}
