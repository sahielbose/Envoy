# ENVOY_GUARDRAILS.md — hard rules

Non-negotiable. These override convenience and any other doc. Enforce them in code, not just prose.

## 1. Mock-first (Phases 1–19)
Every external dependency — LLM, embeddings, web search, job boards, auth, storage, email, cron — sits behind a TypeScript interface with a **mock implementation** returning deterministic fixtures. The whole product runs and all tests pass with `USE_MOCKS=true` and **zero API keys**. No real calls to paid/external services and no secrets are required until **Phase 20**, which adds real adapters behind the same interfaces (one provider per commit, gated by env).

## 2. Outreach is draft-only + approval-gated
- Agent tools only **draft**. There is **no send path inside any tool** (`draft_outreach` returns content; it never transmits). Add a test that proves nothing sends without explicit, per-message user approval.
- Sending is a separate, explicit user action on a specific final message. Defaults are zero-risk: **copy** and **open in mail**. Sending via the user's connected Gmail is opt-in and approved per message.
- **Never auto-apply** to jobs. Envoy assists; the user submits.

## 3. Truthful tailoring only
Tailored résumés/cover letters re-emphasize and reframe **real** experience. They must never fabricate employers, titles, dates, degrees, or skills. Enforce a truthfulness guard: every claim in a tailored doc must trace to the base résumé/profile (Phase 13 + eval in Phase 18). Surface a "we only reword what's true" note in the résumé studio.

## 4. Data sourcing — ToS-friendly only
**Use:** Greenhouse / Lever / Ashby **public board APIs** (primary; great startup coverage), **Adzuna** (aggregate), company career/About pages and public web via Exa/Tavily, and **user-provided** inputs (a pasted job URL, a named interviewer, a public profile the user supplies).
**Do NOT:** scrape LinkedIn, Indeed, or any site against its ToS; run headless-browser harvesting; build a **people contact-info database** (no email/phone enrichment or harvesting); automate LinkedIn actions. `map_contacts` returns *roles/archetypes to reach and why* + publicly-listed names only. `research_company` uses public web data only and never returns harvested private contact info. Build ingestion as a pluggable `JobSource` interface so sources can be added/removed cleanly.

## 5. Privacy of PII
Résumés are sensitive. Encrypt at rest where feasible, scope access to the owning user, never put PII in URLs/logs, and keep the candidate "get discovered" profile + public share link **opt-in and revocable** (off by default). Don't compile or sell personal data.

## 6. Information, not advice
Envoy isn't a career counselor, lawyer, or immigration advisor; surface that for big decisions users should consult a professional. Work authorization is a preference field, not legal guidance. Never present a match score as certainty — always show reasoning + gaps. Don't claim "companies will apply to you"; the profile is a presentation tool, not a marketplace.

## 7. Evals (quality is a guardrail)
A lightweight harness from the start (Phase 18, runnable as `npm run eval`, CI-gated):
- **Match relevance** — labeled (profile, jobs) cases; track precision + reasoning quality; catch confidently-wrong matches.
- **Outreach quality** — rubric: specific, personalized, concise, grounded in the user's real background, no hallucinated claims; reject generic AI-spam.
- **Tailoring no-fabrication** — assert every claim traces to source.
