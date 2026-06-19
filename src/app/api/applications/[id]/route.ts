import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";
import { ApplicationStageSchema, NextActionSchema } from "@/lib/domain";
import type { ApplicationPatch } from "@/server/repositories";

export const runtime = "nodejs";

const Body = z.object({
  stage: ApplicationStageSchema.optional(),
  notes: z.string().nullable().optional(),
  nextAction: NextActionSchema.optional(),
  resumeFileId: z.string().nullable().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid update." }, { status: 400 });

  const { id } = await params;
  const repos = getRepositories();
  const app = await repos.applications.findById(id);
  if (!app || app.userId !== session.user.id) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const patch: ApplicationPatch = {};
  if (parsed.data.stage !== undefined) patch.stage = parsed.data.stage;
  if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes;
  if (parsed.data.nextAction !== undefined) patch.nextAction = parsed.data.nextAction;
  if (parsed.data.resumeFileId !== undefined) patch.resumeFileId = parsed.data.resumeFileId;

  const updated = await repos.applications.update(id, patch);
  return Response.json({ id: updated.id, stage: updated.stage });
}
