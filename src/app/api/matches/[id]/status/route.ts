import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepositories } from "@/server/repositories";

export const runtime = "nodejs";

const Body = z.object({ status: z.enum(["new", "saved", "dismissed", "tracked"]) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  try {
    const updated = await getRepositories().matches.setStatus(id, parsed.data.status);
    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch {
    return NextResponse.json({ error: "Match not found." }, { status: 404 });
  }
}
