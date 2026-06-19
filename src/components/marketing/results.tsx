import { Eyebrow } from "@/components/ui";

/** "Why it works" — heading + nebula card with two glass stats. */
export function Results() {
  return (
    <section className="section container">
      <div className="results__head">
        <div>
          <Eyebrow>Why it works</Eyebrow>
          <h2 className="serif">
            Faster, Warmer, <span className="lt">Smarter</span>
          </h2>
        </div>
        <p>
          Envoy is built on the same recommendation systems behind the world&apos;s biggest
          platforms — pointed at your career instead of your feed.
        </p>
      </div>
      <div className="results__card art--nebula grain">
        <div className="glass">
          <b>5x</b>
          <span>More replies than cold applications</span>
        </div>
        <div className="glass">
          <b>~80%</b>
          <span>Of roles filled through referrals before they&apos;re posted</span>
        </div>
      </div>
    </section>
  );
}
