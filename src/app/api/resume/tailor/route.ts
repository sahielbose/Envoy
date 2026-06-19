import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";
import { getDoc } from "@/server/resume/tailor";

export const runtime = "nodejs";

const Body = z.object({ jobId: z.string() });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "jobId is required." }, { status: 400 });

  const profile = await getRepositories().profiles.findByUserId(session.user.id);
  if (!profile) return Response.json({ error: "Complete onboarding first." }, { status: 400 });

  const out = await getServices().tailorResume({ profileId: profile.id, jobId: parsed.data.jobId });
  const resume = getDoc(out.resumeDocId);
  const cover = getDoc(out.coverLetterDocId);

  return Response.json({
    ...out,
    resumeText: resume?.text ?? "",
    coverText: cover?.text ?? "",
  });
}
