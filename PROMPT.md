# Claude Code kickoff prompt

Paste this into Claude Code at the repo root.

---

Build **Envoy**, an AI job-search & career copilot — a candidate-side functional clone of Perfectly's "Parker", with our own brand.

Read these first and treat them as the source of truth:
- `CLAUDE.md` and `ENVOY_CONTEXT.md` — architecture, stack, data model, tool contracts
- `ENVOY_PRODUCT.md` — what to build (features + principles)
- `ENVOY_UI.md` + `landing.html` — the exact UI to reproduce in React
- `ENVOY_GUARDRAILS.md` — hard rules (mock-first, approval-gated outreach, never auto-apply, no scraping, privacy, evals)
- `ENVOY_BUILD_PLAN.md` — the 20-phase plan with the exact, ordered commit list

Execute the build plan **autonomously, Phase 1 → Phase 20, in order**. For every commit bullet: implement it, run `npm run typecheck && npm run lint && npm run test`, then commit with the exact message. Make **small, logical commits** (~120 total) — never squash a phase. Don't advance past a phase until its Definition of Done passes.

**Mock-first is mandatory.** Every external service (LLM, embeddings, web search, job boards, auth, storage, email, cron) sits behind an interface with a mock implementation. The whole app must run and pass tests with `USE_MOCKS=true` and **zero API keys**. Do not call any real external API or require any secret until **Phase 20**, which wires the real adapters behind the same interfaces using env vars I'll provide.

Reproduce `landing.html` faithfully (warm cream, Fraunces + Inter, espresso buttons, gradient art, interactive app preview) as React components.

Don't stop for confirmation between phases — keep going until Phase 20 is complete. If something is ambiguous, follow the context docs; if still ambiguous, choose the simplest option consistent with `ENVOY_GUARDRAILS.md` and note it in the commit body.
