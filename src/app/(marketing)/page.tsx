import { Hero } from "@/components/marketing/hero";
import { AppPreview } from "@/components/marketing/app-preview";
import { Process } from "@/components/marketing/process";
import { Testimonial } from "@/components/marketing/testimonial";
import { SuccessStory } from "@/components/marketing/success-story";

export default function HomePage() {
  return (
    <main>
      <Hero>
        <AppPreview />
      </Hero>
      <Process />
      <Testimonial />
      <SuccessStory />
    </main>
  );
}
