import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getServices } from "@/server/services";

export const runtime = "nodejs";

const Body = z.object({ company: z.string().min(1), jobId: z.string().optional() });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "A company is required." }, { status: 400 });

  const out = await getServices().researchCompany({
    company: parsed.data.company,
    jobId: parsed.data.jobId,
  });
  return Response.json(out);
}
