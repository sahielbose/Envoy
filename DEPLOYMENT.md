# Deploying Envoy (live integrations)

Envoy is **mock-first**: it runs end-to-end with `USE_MOCKS=true` and zero secrets.
Every external service sits behind an interface with a mock and a real adapter,
selected by env. Going live is a matter of supplying keys and turning mocks off —
**per provider**, so you can flip one at a time and verify with `npm run smoke`.

## The switch

- `USE_MOCKS=true` (default) → every provider uses its mock.
- `USE_MOCKS=false` → every provider uses its real adapter (and its keys are required).
- `MOCK_<PROVIDER>=true|false` overrides the master switch for one provider.

Providers: `db · llm · embeddings · search · jobs · auth · storage · email · cron`.

Example — go live on matching only, keep the rest mocked:

```bash
USE_MOCKS=true
MOCK_DB=false MOCK_EMBEDDINGS=false   # real Postgres + Voyage; everything else mocked
```

## Keys per provider

| Provider | Env | Adapter |
|---|---|---|
| db | `DATABASE_URL` | Prisma + pgvector (Neon/Supabase) |
| llm | `ANTHROPIC_API_KEY` (`ANTHROPIC_MODEL`) | Claude via the Vercel AI SDK |
| embeddings | `VOYAGE_API_KEY` (`VOYAGE_MODEL`) | Voyage embeddings (1024-d) |
| search | `EXA_API_KEY` | Exa web research |
| jobs | `GREENHOUSE_BOARDS`, `LEVER_COMPANIES`, `ASHBY_BOARDS`, `ADZUNA_APP_ID`/`ADZUNA_APP_KEY` | Live public boards + Adzuna |
| auth | `GOOGLE_CLIENT_ID`/`SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Auth.js (Google) |
| storage | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Cloudflare R2 (S3) |
| email | `RESEND_API_KEY` (`EMAIL_FROM`) | Resend (sends only through the approval gate) |
| cron | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Inngest Cloud (`/api/inngest`) |

A misconfigured live provider fails loudly via `requireProvider` listing the missing keys.

## Steps

1. **Provision** a Postgres (Neon/Supabase) and the provider accounts above; put keys in your host's env.
2. **Database**: `npm run db:deploy` (enable pgvector → push schema → index vectors). Seed if desired with `npm run db:seed`.
3. **Deploy** the Next.js app (e.g. Vercel). Set `USE_MOCKS=false` (or per-provider `MOCK_*=false`).
4. **Inngest**: point Inngest Cloud at `https://<your-domain>/api/inngest` to register the cron functions.
5. **Smoke test**: `npm run smoke` (live-checks unmocked embeddings, search, and db; no emails sent, no LLM tokens spent).

## Guardrails still apply live

Outreach is draft-only and approval-gated; the only send path is `POST
/api/outreach/[id]/send`, which requires an approved draft, Gmail/Resend
connected, a user-provided recipient, and explicit confirmation. `map_contacts`
and `research_company` return archetypes + public data only — `assertNoContactInfo`
rejects any output containing contact info. Tailoring stays truthful. See
`ENVOY_GUARDRAILS.md`.
