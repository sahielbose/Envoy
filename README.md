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
npm run db:setup            # enable pgvector → db push → index vectors → seed
```

Then sign in is mocked — open `http://localhost:3000`, click **Get Started**, and explore the app at `/dashboard`.

## Using the app
A demo session ("Alex Rivera") is signed in automatically in mock mode, with seeded data so every surface is populated:

| Route | What it does |
|---|---|
| `/` | Marketing landing (the `landing.html` reference, reproduced in React) |
| `/onboarding` | Upload a résumé → preview the parsed profile → set preferences → build your profile |
| `/dashboard` | New matches, pending approvals, upcoming follow-ups, active applications |
| `/chat` | The Envoy copilot — ask "find me senior frontend roles" and matches stream inline |
| `/matches` | Ranked roles with score, plain-English reasoning, and gaps; save/dismiss |
| `/resume` | Tailor your résumé + cover letter per posting (truthful, with a diff) and export PDF/DOCX |
| `/research` | Company + interviewer dossiers, likely questions, and questions to ask |
| `/outreach` | Review tone-variant drafts; approve & copy or open in mail (never auto-sends) |
| `/tracker` | Kanban/table pipeline from saved → signed, with notes and next actions |
| `/settings` | Notification, reminder, and Gmail-connect preferences |
| `/styleguide` | The design-system primitives |

Fire the mock cron jobs in dev (notifications appear in the bell):
```bash
curl -s localhost:3000/api/dev/cron -d '{"job":"match-refresh"}' -H 'content-type: application/json'
# jobs: ingest · match-refresh · followup-reminder · interview-reminder
```

## Scripts
`dev` · `build` · `start` · `lint` · `typecheck` · `test` · `test:e2e` · `eval` · `db:setup` · `db:push` · `db:seed` · `db:studio` · `format`

Quality gate (run before every commit): `npm run typecheck && npm run lint && npm run test && npm run eval`. Accessibility: `npx playwright install && npm run test:e2e` runs an axe-core WCAG2 A/AA check.

## Mock-first
The app runs end to end with `USE_MOCKS=true` and **zero secrets**. Every external service (LLM, embeddings, web search, job boards, auth, storage, email, cron) sits behind an interface with a mock; a real adapter is swapped in behind the same interface in Phase 20, gated per-provider by env. See `ENVOY_GUARDRAILS.md`.

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
