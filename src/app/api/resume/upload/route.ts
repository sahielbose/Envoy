import { NextResponse } from "next/server";
import { getStorage } from "@/server/storage";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "application/octet-stream",
  "",
]);

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB)." }, { status: 413 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Please upload a PDF, DOCX, or text résumé." }, { status: 415 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const meta = await getStorage().put({
    filename: file.name || "resume",
    contentType: file.type || "application/octet-stream",
    bytes,
  });

  return NextResponse.json(meta);
}
