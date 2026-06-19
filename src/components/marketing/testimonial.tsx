import { GradientArt } from "@/components/ui";

/** Full-width quote card over gradient art. */
export function Testimonial() {
  return (
    <section className="section container" style={{ paddingTop: 0 }}>
      <div className="quote-card">
        <GradientArt variant="rose" className="layer" />
        <div className="scrim" />
        <div className="qc">
          <span className="mark">“</span>
          <blockquote>
            I&apos;d been applying into the void for months. Envoy got me three warm intros in a
            single week — I start at the company I actually wanted on Monday.
          </blockquote>
          <div className="by">
            Maya R.
            <small>Senior Product Designer</small>
          </div>
        </div>
      </div>
    </section>
  );
}
