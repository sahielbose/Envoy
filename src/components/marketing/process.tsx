"use client";

import { useState } from "react";
import { Eyebrow, GradientArt, type ArtVariant } from "@/components/ui";
import { cn } from "@/lib/utils";

const STEPS: { word: string; num: string; variant: ArtVariant; title: string; body: string }[] = [
  {
    word: "Profile",
    num: "01",
    variant: "violet",
    title: "Profile",
    body: "Drop your résumé and LinkedIn. Envoy does its homework and builds a picture of where you stand out — no rigid forms.",
  },
  {
    word: "Match",
    num: "02",
    variant: "amber",
    title: "Match",
    body: "Built on the same recommendation systems that power the world's biggest platforms — Envoy surfaces the roles you deserve and tells you exactly why each one fits.",
  },
  {
    word: "Connect",
    num: "03",
    variant: "sage",
    title: "Connect",
    body: "Envoy maps the right people to reach and drafts warm, personal outreach that sounds like you. Nothing sends without your approval.",
  },
  {
    word: "Prepare",
    num: "04",
    variant: "rose",
    title: "Prepare",
    body: "Walk into every round with a dossier on the company and your interviewers, the questions they'll likely ask, and the smart ones to ask back.",
  },
];

/** "How it works" — four tabbed steps with gradient art + caption. */
export function Process() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section className="section container" id="how">
      <div className="proc__head">
        <Eyebrow>How it works</Eyebrow>
        <h2>Envoy is your AI career super-connector</h2>
        <p>
          It learns where you shine, finds the roles you deserve, maps who to reach, and prepares
          you for every round — improving with everything you tell it.
        </p>
      </div>

      <div className="proc__grid">
        <div className="proc__list" role="tablist" aria-label="How Envoy works">
          {STEPS.map((s, i) => (
            <button
              key={s.word}
              type="button"
              role="tab"
              aria-selected={active === i}
              className={cn("proc__item", active === i && "is-active")}
              onClick={() => setActive(i)}
            >
              <span className="w">{s.word}</span>
              <span className="num">{s.num}</span>
            </button>
          ))}
        </div>

        <div className="proc__media">
          <GradientArt variant={step.variant} />
          <div className="art-cap">
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
