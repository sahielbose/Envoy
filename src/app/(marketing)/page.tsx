import dynamic from "next/dynamic";
import { Hero } from "@/components/marketing/hero";
import { LogoStrip } from "@/components/marketing/logo-strip";

// Code-split the interactive preview into its own chunk; reserve its height to
// avoid layout shift while it loads.
const AppPreview = dynamic(
  () => import("@/components/marketing/app-preview").then((m) => m.AppPreview),
  { loading: () => <div className="appwrap" style={{ minHeight: 480 }} aria-hidden="true" /> },
);
import { Process } from "@/components/marketing/process";
import { Testimonial } from "@/components/marketing/testimonial";
import { SuccessStory } from "@/components/marketing/success-story";
import { GettingStarted } from "@/components/marketing/getting-started";
import { Results } from "@/components/marketing/results";
import { Why } from "@/components/marketing/why";
import { FAQ } from "@/components/marketing/faq";
import { Reveal } from "@/components/marketing/reveal";

export default function HomePage() {
  return (
    <main id="main">
      <Hero>
        <AppPreview />
      </Hero>
      <Reveal>
        <LogoStrip />
      </Reveal>
      <Reveal>
        <Process />
      </Reveal>
      <Reveal>
        <Testimonial />
      </Reveal>
      <Reveal>
        <SuccessStory />
      </Reveal>
      <Reveal>
        <GettingStarted />
      </Reveal>
      <Reveal>
        <Results />
      </Reveal>
      <Reveal>
        <Why />
      </Reveal>
      <Reveal>
        <FAQ />
      </Reveal>
    </main>
  );
}
