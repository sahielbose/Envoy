# Envoy

Your AI job-search & career copilot. Drop your résumé and LinkedIn, and Envoy finds the roles you deserve, maps who to reach, drafts outreach that sounds like you, researches every company before your interviews, and tracks each application — because most jobs are filled through referrals long before they're ever posted.

Envoy is a **candidate-side functional clone** of Perfectly's consumer product "Parker", built with its own brand, copy, and identity.

## Quickstart
```bash
npm install
cp .env.example .env        # USE_MOCKS=true — no API keys needed yet
npm run dev                 # http://localhost:3000
```
Optional local database (needed once you run real matching/persistence, Phase 5+):
```bash
docker compose up -d        # Postgres + pgvector
npm run db:push && npm run db:seed
```

## Scripts
`dev` · `build` · `start` · `lint` · `typecheck` · `test` · `test:e2e` · `eval` · `db:push` · `db:seed` · `db:studio` · `format`

## Mock-first
The app runs end to end with `USE_MOCKS=true` and **zero secrets**. Every external service (LLM, embeddings, web search, job boards, auth, storage, email, cron) sits behind an interface with a mock. Real API keys are wired only in the final build phase. See `ENVOY_GUARDRAILS.md`.

## Docs
- `CLAUDE.md` — entry point + working agreement
- `ENVOY_CONTEXT.md` — architecture, stack, data model, tool contracts
- `ENVOY_PRODUCT.md` — research + feature spec
- `ENVOY_UI.md` — design system + UI spec (`landing.html` is the reference)
- `ENVOY_GUARDRAILS.md` — hard rules (mock-first, approval-gated outreach, no scraping, privacy, evals)
- `ENVOY_BUILD_PLAN.md` — 20-phase plan (~120 commits)

## Stack
Next.js 15 · TypeScript · Tailwind · Postgres + Prisma + pgvector · Vercel AI SDK + Anthropic Claude · Voyage embeddings · Exa research · Greenhouse/Lever/Ashby/Adzuna jobs · Auth.js · Inngest · Vitest/Playwright.

## Boundaries
Functional clone, not a brand clone — no Perfectly logo/name/screenshots/copy. Envoy assists; it never auto-applies and never sends outreach without your approval. Information, not career/legal advice.
