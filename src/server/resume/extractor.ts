export interface ExtractInput {
  bytes: Uint8Array;
  contentType: string;
  filename: string;
}

/** Extract plain text from a résumé file (pdf/docx/text). */
export interface TextExtractor {
  extract(input: ExtractInput): Promise<string>;
}

/**
 * Stub extractor: decodes text inputs directly. Real PDF/DOCX parsing is wired
 * in Phase 20; until then binary formats decode best-effort and the structured
 * extractor falls back to a draft from the candidate's known profile.
 */
export class StubTextExtractor implements TextExtractor {
  async extract({ bytes }: ExtractInput): Promise<string> {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes).trim();
  }
}

let cached: TextExtractor | null = null;

export function getTextExtractor(): TextExtractor {
  if (!cached) cached = new StubTextExtractor();
  return cached;
}
