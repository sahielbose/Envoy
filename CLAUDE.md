# CLAUDE.md — Envoy

You are building **Envoy**, an AI job-search & career copilot: a **candidate-side functional clone** of Perfectly's consumer product "Parker", with our own brand. This file is the entry point. Read the docs below before writing code and treat them as the source of truth.

> **Layout note:** these spec files are delivered **flat** (all in this one folder, no subfolders). Phase 1 scaffolds the standard tree and moves them into place (`schema.prisma` → `prisma/`, `landing.html` → `design/`, `ci.yml` → `.github/workflows/`, app code under `src/`) — see `ENVOY_CONTEXT.md`.

## Read these first (in this folder)
- **`ENVOY_CONTEXT.md`** — architecture, tech stack, data model, tool contracts, repo layout, env vars, how it builds.
- **`ENVOY_PRODUCT.md`** — deep research on Perfectly/Parker, the Parker→Envoy feature map, product principles, what's out of scope.
- **`ENVOY_UI.md`** — design tokens, components, page map, and the interactive app-preview spec. The visual reference is **`landing.html`** — reproduce it faithfully in React.
- **`ENVOY_GUARDRAILS.md`** — hard rules: mock-first, approval-gated outreach, never auto-apply, no scraping, privacy, evals. These are non-negotiable.
- **`ENVOY_BUILD_PLAN.md`** — the 20-phase plan with the exact, ordered commit list. Build to it.

## Working agreement
- **Execute `ENVOY_BUILD_PLAN.md` autonomously, Phase 1 → 20, in order.** One commit per bullet, conventional-commit style, with the exact message. Many small logical commits (~120 total) — never squash a phase.
- Before each commit: `npm run typecheck && npm run lint && npm run test`. Don't advance to the next phase until its Definition of Done passes.
- **Mock-first (Phases 1–19):** every external service (LLM, embeddings, web search, job boards, auth, storage, email, cron) sits behind an interface with a mock implementation. The app must run and pass tests with `USE_MOCKS=true` and **zero API keys**. Do not call any real external API or require any secret until **Phase 20**, which wires real adapters behind the same interfaces.
- Don't stop for confirmation between phases. If ambiguous, follow the docs; if still ambiguous, choose the simplest option consistent with `ENVOY_GUARDRAILS.md` and note it in the commit body.
- This is a functional clone, **not a brand clone**: our name, copy, and identity only — never Perfectly's logo, brand name, screenshots, or marketing copy.

## Stack (committed — see `ENVOY_CONTEXT.md`)
Next.js 15 (App Router) + TypeScript · Tailwind + shadcn-style components · Postgres + Prisma + pgvector · Vercel AI SDK + Anthropic Claude · Voyage embeddings · Exa research · Greenhouse/Lever/Ashby/Adzuna jobs · Auth.js · Inngest · Vitest/Playwright.
