function ascii(s: string): string {
  return s
    .replace(/[—–]/g, "-")
    .replace(/[·•]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/é/g, "e")
    .replace(/É/g, "E")
    .replace(/[^\x20-\x7E]/g, "");
}

function escapePdf(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** Render plain text to a minimal single-page PDF (Helvetica 11pt). */
export function renderPdf(text: string): Uint8Array {
  const lines: string[] = [];
  for (const raw of text.split("\n")) {
    const a = ascii(raw);
    if (a.length <= 92) lines.push(a);
    else for (let i = 0; i < a.length; i += 92) lines.push(a.slice(i, i + 92));
  }

  let content = "BT\n/F1 11 Tf\n54 740 Td\n14 TL\n";
  for (const line of lines.slice(0, 54)) content += `(${escapePdf(line)}) Tj T*\n`;
  content += "ET";

  const enc = new TextEncoder();
  const contentLen = enc.encode(content).length;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${contentLen} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(enc.encode(pdf).length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = enc.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${off.toString().padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return enc.encode(pdf);
}
