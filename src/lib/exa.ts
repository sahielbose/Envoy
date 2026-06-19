import { env, requireProvider } from "@/lib/env";
import type { SearchResult, WebSearch } from "./search";

const EXA_URL = "https://api.exa.ai/search";

/** Real web research, Exa (public web search with text contents). */
export class ExaWebSearch implements WebSearch {
  constructor() {
    requireProvider("search");
  }

  async search(query: string, opts?: { limit?: number }): Promise<SearchResult[]> {
    const res = await fetch(EXA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.EXA_API_KEY ?? "",
      },
      body: JSON.stringify({
        query,
        numResults: opts?.limit ?? 5,
        contents: { text: { maxCharacters: 400 } },
      }),
    });
    if (!res.ok) throw new Error(`Exa search failed: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as {
      results: { title?: string; url: string; text?: string }[];
    };
    return data.results.map((r) => ({
      title: r.title ?? r.url,
      url: r.url,
      snippet: (r.text ?? "").slice(0, 400),
    }));
  }
}
