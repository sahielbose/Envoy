import { Hero } from "@/components/marketing/hero";
import { AppPreview } from "@/components/marketing/app-preview";
import { Process } from "@/components/marketing/process";
import { Testimonial } from "@/components/marketing/testimonial";
import { SuccessStory } from "@/components/marketing/success-story";
import { GettingStarted } from "@/components/marketing/getting-started";
import { Results } from "@/components/marketing/results";
import { Why } from "@/components/marketing/why";
import { FAQ } from "@/components/marketing/faq";

export default function HomePage() {
  return (
    <main>
      <Hero>
        <AppPreview />
      </Hero>
      <Process />
      <Testimonial />
      <SuccessStory />
      <GettingStarted />
      <Results />
      <Why />
      <FAQ />
    </main>
  );
}
