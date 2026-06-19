import { Eyebrow, GradientArt, type ArtVariant } from "@/components/ui";

const TILES: { variant: ArtVariant; title: string; body: string }[] = [
  {
    variant: "violet",
    title: "Maps your way in",
    body: "The right people at every company on your list.",
  },
  {
    variant: "sage",
    title: "Drafts your outreach",
    body: "Personal, never spammy — and always yours to approve.",
  },
  {
    variant: "amber",
    title: "Preps every round",
    body: "Know the company and your interviewers cold.",
  },
];

/** "Why Envoy" — mission heading + three gradient tiles. */
export function Why() {
  return (
    <section className="section container">
      <div className="why__head">
        <div>
          <Eyebrow>Why Envoy</Eyebrow>
          <h2 className="serif">The hidden job market shouldn&apos;t stay hidden from you</h2>
        </div>
        <p>
          Referrals and warm intros decide most roles before a listing ever appears. Envoy gives
          every job seeker the network, research, and polish that used to be reserved for the
          well-connected.
        </p>
      </div>
      <div className="tiles">
        {TILES.map((t) => (
          <div className="tile" key={t.title}>
            <GradientArt variant={t.variant} />
            <p>
              {t.title}
              <small>{t.body}</small>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
