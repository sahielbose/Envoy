"use client";

import { useRef, useState } from "react";
import { Eyebrow } from "@/components/ui";
import { cn } from "@/lib/utils";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does Envoy work?",
    a: "Drop your résumé and LinkedIn and tell Envoy what you're after. It finds matching roles, maps who to contact, drafts outreach you approve, researches each company before your interviews, and tracks every application in one place.",
  },
  {
    q: "Does Envoy apply to jobs for me?",
    a: "No. Envoy never auto-applies and never auto-sends. It drafts everything for you, and you review and approve each message before it goes out.",
  },
  {
    q: "Where do the job matches come from?",
    a: "Envoy pulls from public job boards and company career pages, then ranks each role against your profile and explains, in plain language, why it fits and where the gaps are.",
  },
  {
    q: "Is my résumé and data private?",
    a: "Yes. Your information is used only to power your own search. It's never sold or shared, and your “get discovered” profile is off by default.",
  },
  {
    q: "How much does it cost?",
    a: "Envoy is free to start while we're in early access. Paid plans will come later — you'll always know before anything changes.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const answer = useRef<HTMLDivElement>(null);

  return (
    <div className={cn("faq__item", open && "open")}>
      <button
        type="button"
        className="faq__q"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {q}
        <span className="pm" aria-hidden="true" />
      </button>
      <div
        className="faq__a"
        ref={answer}
        style={{ maxHeight: open ? answer.current?.scrollHeight : 0 }}
      >
        <p>{a}</p>
      </div>
    </div>
  );
}

/** FAQ accordion. */
export function FAQ() {
  return (
    <section className="section container">
      <div className="faq__head">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="serif">
          We put <span className="lt">you</span> first
        </h2>
        <p>Or start free and see it in action.</p>
      </div>
      <div className="faq">
        {FAQS.map((f) => (
          <FAQItem key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </section>
  );
}
