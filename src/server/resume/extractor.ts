import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { shouldMock } from "@/lib/env";

export interface ExtractInput {
  bytes: Uint8Array;
  contentType: string;
  filename: string;
}

/** Extract plain text from a résumé file (pdf/docx/text). */
export interface TextExtractor {
  extract(input: ExtractInput): Promise<string>;
}

const decodeUtf8 = (bytes: Uint8Array) =>
  new TextDecoder("utf-8", { fatal: false }).decode(bytes).trim();

const anthropicModel = () =>
  createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(
    process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
  );

/**
 * Mock extractor: decodes text inputs directly. Good for .txt / pasted résumés;
 * binary PDF/DOCX decode best-effort (the structured extractor then drafts from
 * the known profile). The real Anthropic extractor handles PDFs properly.
 */
export class StubTextExtractor implements TextExtractor {
  async extract({ bytes }: ExtractInput): Promise<string> {
    return decodeUtf8(bytes);
  }
}

/**
 * Real extractor (Anthropic). PDFs are sent to Claude as a document so the full
 * text is recovered cleanly; text formats decode directly. Falls back to a
 * best-effort decode if the model call fails, so an upload never dead-ends.
 */
export class AnthropicTextExtractor implements TextExtractor {
  async extract({ bytes, contentType, filename }: ExtractInput): Promise<string> {
    const isPdf = contentType.includes("pdf") || filename.toLowerCase().endsWith(".pdf");
    if (!isPdf) return decodeUtf8(bytes);
    try {
      const { text } = await generateText({
        model: anthropicModel(),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the full plain text of this résumé exactly as written. Output only the text, no commentary.",
              },
              { type: "file", data: bytes, mimeType: "application/pdf" },
            ],
          },
        ],
      });
      const out = text.trim();
      return out.length > 0 ? out : decodeUtf8(bytes);
    } catch {
      return decodeUtf8(bytes);
    }
  }
}

let cached: { mock: boolean; impl: TextExtractor } | null = null;

export function getTextExtractor(): TextExtractor {
  const mock = shouldMock("llm");
  if (!cached || cached.mock !== mock) {
    cached = { mock, impl: mock ? new StubTextExtractor() : new AnthropicTextExtractor() };
  }
  return cached.impl;
}
