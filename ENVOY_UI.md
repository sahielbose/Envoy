# ENVOY_UI.md — design system & UI spec

The visual contract. The authoritative reference implementation is **`landing.html`** (a complete, working static build). Reproduce it faithfully in React in Phase 3, then reuse these tokens across the app.

## Direction
A faithful reproduction of Perfectly's aesthetic, rebranded to Envoy: warm and editorial, calm, premium. Warm cream canvas, a characterful serif used large, espresso near-black buttons, soft pill eyebrows, and dreamy gradient "art" blocks in place of photography. Spend boldness on the **interactive app preview** in the hero (replacing their marketing video) — that's the signature element.

## Tokens (mirror `tailwind.config.ts`)
**Color**
- `--bg #F4EEE5` (canvas) · `--bg-alt #EFE7DB` (footer/alt)
- `--ink #2B2117` (headings + dark buttons) · `--ink-soft #6E665A` (body) · `--ink-faint #A89E8D` (numbers/captions)
- `--surface #ECE4D7` (pills/cards/stat tiles) · `--surface-2 #E7DECF` · `--cream #F7F3EB` (text on dark)
- `--line rgba(43,33,23,.10)`
- Gradient accents: violet `#A99BD9`/lilac `#C9BCEA`/pink `#E6B6C8` · amber `#E7B45C`/gold `#F0CE84` · sage `#9FB587`/teal `#7FA9A0` · rose `#E0A6A0`/peach `#F2C7A8` · nebula = teal→orange→navy.

**Type**
- Display: **Fraunces** (Google Fonts, opsz auto), weights 300–600 — all serif headings.
- Body/UI: **Inter**, weights 400–600.
- Scale: hero `clamp(40px,6.6vw,74px)`; section headings `clamp(30px,4.6vw,52px)`; body 17px; eyebrow/caption 13–14px. Headings `letter-spacing:-.02em`, `line-height:1.05`.

**Shape & rhythm:** cards/art radius 22px (quote/portrait/results 26–28px); buttons 11px; pills fully round. Container max 1180px. Section vertical padding `clamp(74px,11vw,128px)`.

## Gradient art (replaces all photos)
Layered radial-gradients per accent (`art--violet/amber/sage/rose/nebula`) with a subtle SVG film-grain overlay (`feTurbulence`, soft-light, ~0.5 opacity). People become gradient avatars (initial on a gradient); client logos become neutral made-up wordmarks. **Never** use Perfectly's photos, logos, or real third-party brand logos. Implement as a `GradientArt` component with a `variant` prop.

## Components (Phase 2)
`Button` (primary/ghost), `Eyebrow`/`Pill`, `Tag`, `Card`, `Section`, `Container`, `GradientArt`, icon wrapper (lucide-react), `FAQItem` (accordion), `Tabs` (for the process block), `AppPreview` (hero), `RoleCard`, `ScoreRing` (conic-gradient), `StatTile`, `TimelineStep`, `QuoteCard`.

## Landing page structure (Phase 3 — order matters)
Sticky nav (centered `Envoy` wordmark; right: "Sign in" ghost + "Get Started") → **Hero** (eyebrow "Now in early access", serif H1 "Get in front of your dream company", subline, CTA, then the app preview) → logo strip ("Job seekers using Envoy have landed at" + wordmarks) → **Process** tabs (Profile/Match/Connect/Prepare + gradient art + caption) → full-width **Testimonial** card → **Success story** (text + twin stat tiles + gradient portrait) → **Getting started** numbered timeline → **Results** (heading + text, then nebula card with two glass stats) → **Why Envoy** (heading + text + three gradient tiles) → **FAQ** accordion → big centered **footer**.

## Interactive app preview (hero signature)
A clickable, **stubbed** product window (`app.envoy.so`) that replaces Perfectly's video: window chrome (traffic dots, URL pill, avatar) + left sidebar nav (**Matches / Chat / Outreach / Tracker / Profile**). Clicking a nav item switches the main panel:
- **Matches** (default) — role cards (gradient company logo, title, company·location·stage tags, conic-gradient match ring, one-line reason).
- **Chat** — a short scripted thread (user asks for roles → Envoy returns top picks as chips → offers to draft an intro) + a disabled composer.
- **Outreach** — a drafted message with tone chips (Warm/Direct/Brief), To/Subject/Body, "Approve & copy" + "Regenerate", and the note "Envoy never sends without your approval."
- **Tracker** — a 4-column kanban (Saved/Outreach/Interview/Offer) with a few cards.
- **Profile** — headline + skill chips + a "Get discovered" toggle (off).
All data is fictional/stubbed; flag it "Interactive preview" + "Demo data". In the real app (Phase 4+) these become live views over the services.

## Copy voice
End-user side of the screen, active voice, sentence case, plain verbs, no filler. Buttons say what happens ("Approve & copy", "Get Started"). Empty/error states give direction in the interface's voice. Keep the candidate-side, insight-led tone from the landing reference.

## Quality floor (Phase 19)
Responsive to mobile (sidebar → horizontal tab row; sections stack), visible keyboard focus, `prefers-reduced-motion` respected, scroll-reveal via IntersectionObserver, axe/lighthouse clean.
