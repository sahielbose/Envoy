import { getSession } from "@/lib/auth/session";
import { getRepositories } from "@/server/repositories";

export const runtime = "nodejs";

/**
 * Approval records the user's intent on a specific draft. It NEVER sends -
 * sending is a separate, explicitly-gated action (the Gmail adapter), per
 * message. The zero-risk defaults remain copy and open-in-mail.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const repos = getRepositories();
  const record = await repos.outreach.findById(id);
  if (!record || record.userId !== session.user.id) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const updated = await repos.outreach.update(id, { status: "approved" });
  return Response.json({ id: updated.id, status: updated.status });
}
