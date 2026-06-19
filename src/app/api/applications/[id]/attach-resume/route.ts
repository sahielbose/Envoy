import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";

export const runtime = "nodejs";

/** Tailor a résumé for this application's role and attach it. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const repos = getRepositories();
  const app = await repos.applications.findById(id);
  if (!app || app.userId !== session.user.id) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }
  const profile = await repos.profiles.findByUserId(session.user.id);
  if (!profile) return Response.json({ error: "Complete onboarding first." }, { status: 400 });

  const tailored = await getServices().tailorResume({ profileId: profile.id, jobId: app.jobId });
  const updated = await repos.applications.update(id, { resumeFileId: tailored.resumeDocId });
  return Response.json({ id: updated.id, resumeFileId: tailored.resumeDocId });
}
