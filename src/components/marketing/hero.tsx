import { Button, Eyebrow } from "@/components/ui";

/**
 * Hero: eyebrow, serif H1, subline, CTA — and a slot for the interactive app
 * preview that replaces the marketing video.
 */
export function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <section className="hero container">
      <Eyebrow>Now in early access</Eyebrow>
      <h1 className="serif">Get in front of your dream company</h1>
      <p className="hero__sub">
        Envoy is your AI career super-connector. It finds the roles you deserve, maps the right
        people to reach, and drafts outreach that sounds like you — because most jobs are filled
        through referrals long before they&apos;re ever posted.
      </p>
      <div className="hero__cta">
        <Button href="#">Get Started Now</Button>
      </div>
      {children}
    </section>
  );
}
