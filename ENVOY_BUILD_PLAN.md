# ENVOY_BUILD_PLAN.md — 20-phase execution plan

> The ordered roadmap for building **Envoy** autonomously with Claude Code. Read alongside `ENVOY_CONTEXT.md` (architecture), `ENVOY_PRODUCT.md` (features), `ENVOY_UI.md` (design), and `ENVOY_GUARDRAILS.md` (hard rules). Build phases **1 → 20 in order**. ~120 commits total.

## How to use this plan

- **One commit per bullet.** Each `type: message` line below is a single small commit. Don't squash a phase into one commit; don't reorder phases.
- **Conventional commits**: `feat:`, `chore:`, `test:`, `docs:`, `refactor:`, `perf:`, `ci:`, `style:`.
- **Definition of Done (DoD) gates each phase.** Don't start the next phase until the current DoD passes `npm run typecheck && npm run lint && npm run test`.
- **Mock-first is mandatory (Phases 1–19).** Every external dependency — LLM, embeddings, web search, job boards, auth, storage, email, cron — sits behind a TypeScript interface with a **mock implementation**. The entire app must run and pass tests with `USE_MOCKS=true` and **zero API keys**. No real network calls to paid/external services and no secrets are required until Phase 20.
- **All live API keys are wired in Phase 20 only.** That phase swaps each mock for a real adapter behind the same interface, gated by env vars. This is the one phase that needs secrets.
- **Autonomy:** proceed phase to phase without waiting for confirmation. If something is ambiguous, follow the context docs; if still ambiguous, pick the simplest option consistent with `ENVOY_GUARDRAILS.md` and note the choice in the commit body.

---

## Phase 1 — Repo foundation & tooling
**Goal:** a booting Next.js app, configured, with docs in place.
**DoD:** `npm run dev` serves a page; `typecheck`, `lint`, `test` all pass on an empty suite; CI is green.
- chore: scaffold Next.js 15 + TypeScript (App Router, `src/`)
- chore: configure Tailwind + PostCSS with Envoy design tokens
- chore: add ESLint + Prettier; base layout, `globals.css`, fonts (Fraunces + Inter)
- chore: add zod-validated env loader with `USE_MOCKS` switch; `.env.example`; `.gitignore`
- ci: add GitHub Actions (typecheck + lint + test, `USE_MOCKS=true`)
- docs: add `ENVOY_*` context docs; link from `CLAUDE.md` + `README.md`

## Phase 2 — Design system & UI primitives
**Goal:** the reusable visual vocabulary from `landing.html`.
**DoD:** a `/styleguide` route renders every primitive; primitive tests pass.
- feat: add color + type scale tokens as CSS variables
- feat: add Button (primary/ghost)
- feat: add Eyebrow/Pill, Tag, and Card components; Section + Container layout primitives
- feat: add GradientArt (violet/amber/sage/rose/nebula) + grain overlay; icon wrapper (lucide-react)
- test: add render tests for UI primitives

## Phase 3 — Marketing landing page (port `landing.html` → React)
**Goal:** pixel-faithful Envoy landing as components.
**DoD:** `/` matches the reference; interactive app-preview, process tabs, and FAQ all work; responsive + reduced-motion verified.
- feat: add marketing route group with shared Nav + Footer
- feat: build Hero (copy, eyebrow, CTA)
- feat: scaffold interactive AppPreview window (bar + sidebar shell)
- feat: add AppPreview panels (matches/chat/outreach/tracker/profile) + tab switching
- feat: build Process tabs section (Profile/Match/Connect/Prepare)
- feat: build Testimonial + Success-story sections
- feat: build Getting-started timeline, Results, Why, FAQ accordion
- feat: add logo strip, scroll-reveal, reduced-motion, and responsive passes

## Phase 4 — App shell, routing & navigation
**Goal:** the authenticated product skeleton (mock session).
**DoD:** every app route renders behind the mock-auth gate with empty/loading states.
- feat: add app route group layout with sidebar nav
- feat: add mock session provider + auth-gated layout placeholder
- feat: add Dashboard skeleton + top bar (notifications/user-menu stubs)
- feat: add route stubs (chat/matches/resume/research/outreach/tracker/profile/settings)
- feat: add shared empty-state + loading-skeleton components

## Phase 5 — Data model & local persistence
**Goal:** Postgres + Prisma + pgvector, with fixtures and a mock data source.
**DoD:** `db:push` + `db:seed` populate a local DB; repository tests pass; mock mode works without a DB.
- feat: add Prisma schema + client wrapper
- chore: add docker-compose (Postgres+pgvector), db scripts, and pgvector migration
- feat: add repository layer (typed data access per model)
- feat: add fixtures (companies, jobs, profile, matches, applications)
- feat: add seed script + `USE_MOCKS` data-source toggle
- test: add repository tests against fixtures

## Phase 6 — Domain types & tool contracts
**Goal:** the typed contracts every feature and the agent share.
**DoD:** all tool schemas validate; mock services return fixtures conforming to them.
- feat: add zod schemas for shared domain types (Profile, Job, Match, …)
- feat: add tool contracts (`find_roles`, `tailor_resume`, `research_company`, `draft_outreach` + supporting `map_contacts`/`parse_resume`/`build_profile`/`track_application`)
- feat: add service interfaces + dependency container
- feat: add mock service implementations returning fixtures
- test: add contract tests for every tool schema

## Phase 7 — Résumé upload & parsing (stubbed)
**Goal:** get a résumé in and turn it into structured data (mock extractor).
**DoD:** uploading a sample résumé yields a structured profile draft in the UI.
- feat: add storage interface + local-disk adapter (mock)
- feat: add résumé upload UI + endpoint
- feat: add text-extraction interface (pdf/docx) with stub extractor
- feat: add structured-extraction service (mock → profile draft)
- feat: add onboarding step 1 (upload + parse preview)
- test: add parsing tests with sample fixtures

## Phase 8 — Profile builder & onboarding
**Goal:** finish onboarding and the candidate profile.
**DoD:** a user completes upload → preferences → profile; "get discovered" is off by default.
- feat: add preferences form (titles/seniority/location/comp/work-auth/dealbreakers)
- feat: add `build_profile` service (mock) + summary
- feat: wire onboarding flow (upload → preferences → profile)
- feat: add profile page (view/edit) + "get discovered" profile + share link (off by default)
- test: add onboarding flow test (mock)

## Phase 9 — Job ingestion layer (mock sources)
**Goal:** normalize roles from multiple sources into `Job` (against fixtures).
**DoD:** ingestion runner populates jobs from all adapters with dedupe; normalization tests pass.
- feat: add JobSource interface + normalizer to `Job`
- feat: add Greenhouse adapter (board fixture)
- feat: add Lever + Ashby adapters (board fixtures)
- feat: add Adzuna adapter (API fixture) + ingestion runner with dedupe/upsert
- test: add adapter normalization tests

## Phase 10 — Embeddings & matching pipeline (mock embeddings)
**Goal:** retrieve-then-rerank `find_roles` end to end (deterministic mock embedder + reranker).
**DoD:** `/matches` shows ranked roles with score + plain-English reasoning + gaps for the seeded profile.
- feat: add embeddings interface + deterministic mock embedder + vector storage
- feat: add pgvector similarity query
- feat: add retrieve step (vector search + hard preference filters)
- feat: add rerank interface + mock reranker (score + reasoning + gaps)
- feat: assemble `find_roles` end-to-end; build Matches view (cards/rings/reasoning, save/dismiss)
- test: add matching pipeline tests

## Phase 11 — Agent runtime (mock LLM, tool-use loop)
**Goal:** the Envoy agent loop with a scripted mock LLM.
**DoD:** agent executes tool calls and streams a response with no real LLM; guardrail tests pass.
- feat: add agent tool registry + execution context
- feat: add LLM provider interface + scripted mock provider
- feat: add tool-use loop executor + SSE streaming (mock token stream)
- feat: add system-prompt module (persona + hard rules)
- test: add agent loop tests (tool calls + guardrails)

## Phase 12 — Chat UI (copilot)
**Goal:** the central chat that drives everything.
**DoD:** "find me X roles" in chat returns real (mock) matches inline and updates `/matches`.
- feat: add chat page with streaming message list
- feat: render inline tool results (role cards/dossier/draft chips)
- feat: add composer + suggested prompts
- feat: wire chat to agent runtime (mock) + persist threads
- test: add chat flow test (mock)

## Phase 13 — Résumé & cover-letter tailoring (mock generation)
**Goal:** truthful per-posting tailoring with export.
**DoD:** generate a tailored résumé + cover letter with a diff; no-fabrication test passes; export works.
- feat: add `tailor_resume` service (mock) → résumé + cover letter + diff
- feat: build résumé studio (base + tailored versions, diff view)
- feat: add truthfulness guard (every claim traces to base)
- feat: add PDF/DOCX export (server render)
- test: add tailoring + no-fabrication tests

## Phase 14 — Company & interviewer research (mock)
**Goal:** pre-round dossiers (mock web research).
**DoD:** a role produces a cached dossier with likely questions + questions to ask.
- feat: add web-research interface (Exa/Tavily) with stub
- feat: add `research_company` service (mock dossier + likely Qs + Qs to ask)
- feat: build research dossier UI
- feat: cache dossiers on `Company`
- test: add research service tests

## Phase 15 — Outreach drafting + approval gates (mock, draft-only)
**Goal:** warm, personal outreach that never sends itself.
**DoD:** drafts generate with tone variants; the approval-gate test proves nothing sends without explicit approval.
- feat: add `map_contacts` service (archetypes + rationale, public-only)
- feat: add `draft_outreach` service (mock, tone variants, **draft-only**)
- feat: build outreach queue UI (review + approve) + copy/open-in-mail
- feat: enforce approval gate (no send path inside any tool)
- feat: add Gmail send adapter behind flag (stub, per-message approval)
- test: assert nothing sends without explicit approval

## Phase 16 — Application tracker + dashboard
**Goal:** the pipeline (the OpenSwarm "View") and the home dashboard.
**DoD:** a role moves through stages; dashboard reflects matches/approvals/follow-ups.
- feat: add `track_application` service + pipeline stages
- feat: build tracker board (kanban) + table view
- feat: add notes, next actions, attach tailored résumé
- feat: wire dashboard aggregations (matches/approvals/follow-ups)
- test: add tracker + dashboard tests

## Phase 17 — Background jobs & cron (mock scheduler)
**Goal:** proactive nudges (mock Inngest).
**DoD:** a stale application produces a follow-up nudge; weekly match refresh fires in dev.
- feat: add Inngest setup + function registry (local dev)
- feat: add scheduled ingestion + match-refresh functions (mock)
- feat: add follow-up + interview reminder functions (mock) + notification center
- feat: add notification preferences in settings
- test: add job function tests

## Phase 18 — Evals, quality & guardrails harness
**Goal:** make match quality and non-spammy outreach measurable.
**DoD:** `npm run eval` runs all eval sets and CI gates on it.
- feat: add eval harness runner (`evals/run.ts`)
- feat: add match-relevance eval set + scorer
- feat: add outreach-quality rubric + scorer
- feat: add tailoring no-fabrication eval
- feat: add PII/no-scrape policy checks enforced in adapters
- ci: gate build on `npm run eval`

## Phase 19 — Accessibility, polish, performance, error states
**Goal:** the quality floor.
**DoD:** keyboard-navigable, reduced-motion respected, mobile clean, axe/lighthouse pass.
- feat: add keyboard focus, aria roles, reduced-motion across the app
- feat: add empty/error/loading states everywhere (interface voice)
- feat: responsive + mobile passes for app views
- perf: optimize art/grain, code-split routes, lazy-load preview panels; add axe/lighthouse checks
- docs: update README run/usage instructions

## Phase 20 — Live integrations: wire real API keys (FINAL)
**Goal:** swap every mock for a real adapter behind the same interface, gated by env. **This is the only phase that needs secrets.** One provider per commit; flip `USE_MOCKS` per-provider as each is verified.
**DoD:** with real keys set, `USE_MOCKS=false` runs end-to-end; live smoke tests pass; app deploys.
- chore: finalize env schema + secret validation for all providers
- feat: integrate Anthropic Claude in agent + generation (`ANTHROPIC_API_KEY`)
- feat: integrate Voyage embeddings, replace mock embedder (`VOYAGE_API_KEY`)
- feat: integrate Exa/Tavily web research, replace stub (`EXA_API_KEY`)
- feat: integrate Greenhouse/Lever/Ashby live boards, replace fixtures
- feat: integrate Adzuna live API (`ADZUNA_APP_ID`/`ADZUNA_APP_KEY`)
- feat: integrate Auth.js Google OAuth + email, replace mock session (`GOOGLE_*`)
- feat: integrate object storage R2/Supabase for résumé files (`R2_*`)
- feat: integrate Resend + optional Gmail OAuth send behind approval (`RESEND_API_KEY`/`GMAIL_*`)
- feat: wire Inngest Cloud + deploy functions (`INNGEST_*`)
- feat: connect production Postgres (Neon/Supabase) + run migrations (`DATABASE_URL`)
- chore: flip `USE_MOCKS=false`, run live smoke tests; add deployment guide

> **Follow-on (post-1.0, optional):** wrap the services as an MCP server for OpenSwarm and expose the tracker as the View + the cron jobs as the Cron surface (see `ENVOY_CONTEXT.md` §"OpenSwarm integration"). Keep `draft_outreach` draft-only over MCP too.

---

## Commit count by phase

| Phase | Commits | | Phase | Commits |
|---|---|---|---|---|
| 1 | 6 | | 11 | 5 |
| 2 | 5 | | 12 | 5 |
| 3 | 8 | | 13 | 5 |
| 4 | 5 | | 14 | 5 |
| 5 | 6 | | 15 | 6 |
| 6 | 5 | | 16 | 5 |
| 7 | 6 | | 17 | 5 |
| 8 | 5 | | 18 | 6 |
| 9 | 5 | | 19 | 5 |
| 10 | 6 | | 20 | 12 |

**Total ≈ 120 commits.** Split a bullet into two commits whenever a step turns out larger than expected — more small commits is always fine; fewer large ones is not.
