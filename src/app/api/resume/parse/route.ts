import { NextResponse } from "next/server";
import { z } from "zod";
import { getServices } from "@/server/services";

export const runtime = "nodejs";

const Body = z.object({ fileId: z.string() });

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "fileId is required." }, { status: 400 });
  }
  const result = await getServices().parseResume({ fileId: parsed.data.fileId });
  return NextResponse.json(result);
}
