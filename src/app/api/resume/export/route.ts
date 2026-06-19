import { getSession } from "@/lib/auth/session";
import { getDoc } from "@/server/resume/tailor";
import { renderPdf } from "@/server/resume/export/pdf";
import { renderDocx } from "@/server/resume/export/docx";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const docId = url.searchParams.get("docId") ?? "";
  const format = url.searchParams.get("format") === "docx" ? "docx" : "pdf";

  const doc = getDoc(docId);
  if (!doc) return new Response("Not found", { status: 404 });

  const base = doc.kind === "cover" ? "cover-letter" : "resume";
  const filename = `${base}.${format}`;

  // Uint8Array is a valid body at runtime; the cast sidesteps the lib's
  // Uint8Array<ArrayBuffer> vs ArrayBufferLike strictness.
  if (format === "docx") {
    return new Response(renderDocx(doc.text) as unknown as BodyInit, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return new Response(renderPdf(doc.text) as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
