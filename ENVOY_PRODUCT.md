# ENVOY_PRODUCT.md — research & feature spec

What Envoy is, grounded in the product we're cloning. Pairs with `ENVOY_CONTEXT.md` (how it's built).

## The company we're cloning (context only)
**Perfectly** (Y Combinator W26; San Francisco; founded 2025; 3 people). Founders are ex-TikTok/Meta ML: Victor Luo (ex-ML Scientist, TikTok), Gary Luo (ex-MLE, Meta + TikTok), Huimin Xie (ex-Tech Lead/Senior MLE, TikTok). Thesis: **"hiring should work like a recommendation system."** Two products:
- **Paul** — the B2B Recruiting OS. Automates sourcing → outreach → screening → qualification for startups; "interview-ready candidates just show up in Slack." Claims 4× faster hiring, 10× candidate volume, 2× interview pass rates.
- **Parker** — the **consumer** product (the side we clone): *"AI career super-connector that pulls strings to actually get you in front of your dream company."*

> **The moat we do NOT clone:** their proprietary candidate recommendation system and **two-sided network** (companies come to them, so roles flow to candidates). We build the candidate-side mirror on **public/legitimate data + LLM reasoning**, with no recruiter network behind it.

## Parker — what we clone
**Core insight (keep central):** ~70–80% of tech jobs are filled through referrals/warm intros before they're ever posted. Job boards alone mean you're already late. "Your value shouldn't be a secret."

**What Parker does:** (1) understands the market and maps exactly *who* to connect with, then drafts highly personalized outreach that sounds like you, to get you in the door; (2) gets you in front of hiring managers (via their network). It's **conversational** (iMessage/WhatsApp) — learns through chat, not forms — and "does its homework" after you share LinkedIn + résumé. Flow: **Share background → Chat naturally → Make the connection (intel + warm connections + outreach drafts) → Get discovered** (join the network so teams apply to you).

## Parker → Envoy feature map (Phase 1 scope)
| Parker capability | Envoy equivalent |
|---|---|
| Knows the right people & connects you | `map_contacts` + `draft_outreach` — identify the right *roles/archetypes* (and publicly-listed names) via public company data + web research; draft outreach. **No contact-info scraping.** |
| Gets you in front of hiring managers (their network) | We can't reproduce a network. Mirror with proactive `find_roles` matching + a candidate **profile** ("get discovered", off by default). |
| Conversational, not forms (iMessage/WhatsApp) | **Web-first in-app chat agent.** SMS/WhatsApp is a later phase. |
| "Does its homework" | `parse_resume` + `build_profile` + enrichment. |

**Canonical Envoy features (build these):**
1. **Onboarding & profile build** — résumé (PDF/DOCX) + LinkedIn + preferences (titles, seniority, locations/remote, comp, work auth, stage, must-haves/dealbreakers) → structured profile.
2. **Conversational copilot (Envoy)** — chat that calls tools and writes to the views.
3. **Role matching & feed** — ranked roles with match score + plain-English "why it fits / gaps"; filter, save/dismiss, track.
4. **Who-to-contact mapping** — the right people/roles to reach at a target company, with rationale.
5. **Personalized outreach drafting** — warm, non-spammy, sounds like the user; tone variants; **approval-gated, never auto-sent**.
6. **Résumé & cover-letter tailoring** — per posting; truthful (never fabricated); diff vs base; export PDF/DOCX.
7. **Company & interviewer research** — dossier: overview, news/funding, product, culture, the people you'll talk to, likely questions, smart questions to ask.
8. **Application tracker (the View)** — `Saved → Researching → Outreach sent → Applied → Interviewing → Offer → Closed`, with notes, next action, attached tailored résumé.
9. **Proactive nudges (Cron)** — "3 new matches this week", "follow up on the Acme application", "interview in 2 days — prep ready".
10. **Candidate profile ("get discovered" mirror)** — polished one-pager + optional public share link.
11. **Dashboard** — new matches, pending approvals, upcoming follow-ups/interviews, pipeline summary.
12. **Settings & integrations** — base résumé, notification/cron prefs, optional Gmail connect (approved sends only).

## Out of scope (their moat / regulated / ToS-risky)
The recruiter marketplace / two-sided network; the B2B Recruiting OS (Paul); scraping LinkedIn/Indeed or building a people contact-info database; auto-applying or auto-sending. (See `ENVOY_GUARDRAILS.md`.)

## Product principles
- **Match quality + non-spammy outreach are the product** — treat as an eval problem from day one.
- **Information & assistance, not guarantees** — not career/legal/immigration advice; no promised outcomes.
- **Human in the loop for anything that leaves the app** — draft, review, approve, then send.
- **Truthful tailoring** — re-emphasize real experience; never invent employers, titles, dates, or skills.
- **Conversation first, structure as a byproduct** — chat is the front door; the views are what it produces.
