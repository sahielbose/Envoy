import { Button, Eyebrow } from "@/components/ui";

const STEPS = [
  {
    n: "01",
    title: "Set up your profile",
    pills: ["Under 10 min", "Day 1"],
    body: "Upload your résumé and LinkedIn and set your targets. Envoy builds your profile and surfaces your first matches the same day.",
  },
  {
    n: "02",
    title: "Get matched & connected",
    pills: ["Week 1", "~20 min/wk"],
    body: "Review the roles worth your time, approve the outreach Envoy drafts, and watch the replies start coming in.",
  },
  {
    n: "03",
    title: "Land the offer",
    pills: ["The goal", "~15 min/wk"],
    body: "Prep for every round with company and interviewer dossiers, and track each application all the way to signed.",
  },
];

/** "Getting started" — copy on the left, numbered timeline on the right. */
export function GettingStarted() {
  return (
    <section className="section container">
      <div className="split" style={{ alignItems: "start" }}>
        <div className="how__left">
          <Eyebrow>Getting started</Eyebrow>
          <h2 className="serif">Set it up once. Envoy runs your search.</h2>
          <p>
            Spend a few minutes a week. Envoy does the hunting, the research, and the drafting — you
            make the calls.
          </p>
          <Button href="#">Get Started</Button>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <div className="step__n">{s.n}</div>
              <div>
                <div className="step__h">
                  <b>{s.title}</b>
                  {s.pills.map((p) => (
                    <span className="minipill" key={p}>
                      {p}
                    </span>
                  ))}
                </div>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
