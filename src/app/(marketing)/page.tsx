import { Hero } from "@/components/marketing/hero";
import { AppPreview } from "@/components/marketing/app-preview";
import { LogoStrip } from "@/components/marketing/logo-strip";
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
