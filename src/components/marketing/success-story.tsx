import { Eyebrow, GradientArt } from "@/components/ui";

/** Success story: narrative + twin stat tiles + gradient portrait. */
export function SuccessStory() {
  return (
    <section className="section container">
      <div className="split success">
        <div>
          <Eyebrow>Success stories</Eyebrow>
          <h2 className="serif">3 warm intros in the first week</h2>
          <div className="success__p">
            <p>
              Maya had spent four months applying cold — résumés into a black hole, no replies, no
              momentum.
            </p>
            <p>
              A week after starting with Envoy, she had three warm introductions to hiring managers
              at companies on her list, plus tailored notes for each conversation.
            </p>
            <p>Two weeks later, she signed an offer.</p>
          </div>
          <div className="stats">
            <div className="stat">
              <b>5x</b>
              <span>More replies</span>
              <small>vs. cold applications</small>
            </div>
            <div className="stat">
              <b>2 wks</b>
              <span>Intro to offer</span>
              <small>start to finish</small>
            </div>
          </div>
        </div>
        <div className="portrait">
          <GradientArt variant="amber" className="layer" />
          <div className="avatar-xl">
            <span>M</span>
          </div>
          <div className="scrim" />
          <div className="who">
            <b>Maya R.</b>
            <small>Senior Product Designer</small>
          </div>
        </div>
      </div>
    </section>
  );
}
