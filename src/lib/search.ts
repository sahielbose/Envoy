export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/** Public web research. Mock = deterministic stub; Phase 20 = Exa/Tavily. */
export interface WebSearch {
  search(query: string, opts?: { limit?: number }): Promise<SearchResult[]>;
}

function subjectOf(query: string): string {
  const trimmed = query
    .replace(/\s+(company|news|funding|product|culture|interview|about).*$/i, "")
    .trim();
  return trimmed || query.trim() || "the company";
}

/**
 * Deterministic stub returning public-style results (news, careers, blog,
 * about). Never returns private contact info — public web data only.
 */
export class StubWebSearch implements WebSearch {
  async search(query: string, opts?: { limit?: number }): Promise<SearchResult[]> {
    const subject = subjectOf(query);
    const slug = subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const results: SearchResult[] = [
      {
        title: `${subject} raises a new funding round`,
        url: `https://news.example.com/${slug}-funding`,
        snippet: `${subject} announced new funding to expand its product and team.`,
      },
      {
        title: `${subject} — Careers`,
        url: `https://example.com/${slug}/careers`,
        snippet: `${subject} is hiring across engineering, design, and product.`,
      },
      {
        title: `${subject} Engineering Blog`,
        url: `https://blog.example.com/${slug}`,
        snippet: `How ${subject} builds and ships its customer-facing platform.`,
      },
      {
        title: `${subject} — About`,
        url: `https://example.com/${slug}/about`,
        snippet: `${subject} is a remote-friendly startup focused on its core product.`,
      },
      {
        title: `${subject} company overview`,
        url: `https://directory.example.com/${slug}`,
        snippet: `Public overview of ${subject}: stage, team size, and recent milestones.`,
      },
    ];
    return results.slice(0, opts?.limit ?? results.length);
  }
}

let cached: WebSearch | null = null;

export function getWebSearch(): WebSearch {
  if (!cached) cached = new StubWebSearch();
  return cached;
}
