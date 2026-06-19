import { Hero } from "@/components/marketing/hero";
import { AppPreview } from "@/components/marketing/app-preview";
import { Process } from "@/components/marketing/process";

export default function HomePage() {
  return (
    <main>
      <Hero>
        <AppPreview />
      </Hero>
      <Process />
    </main>
  );
}
