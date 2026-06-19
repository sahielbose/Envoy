import type { Metadata } from "next";
import { ArrowRight, Sparkles, Mail, Users } from "lucide-react";
import {
  Button,
  Eyebrow,
  Pill,
  Tag,
  Card,
  Container,
  Section,
  GradientArt,
  Icon,
  type ArtVariant,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Styleguide, Envoy",
  description: "The Envoy design system: tokens, primitives, and gradient art.",
};

const ART_VARIANTS: ArtVariant[] = ["violet", "amber", "sage", "rose", "nebula"];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 44 }}>
      <h2 className="serif" style={{ fontSize: "var(--fs-h3)", margin: "0 0 18px" }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
        {children}
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main>
      <Section>
        <Container>
          <Eyebrow>Design system</Eyebrow>
          <h1
            className="serif"
            style={{ fontSize: "var(--fs-h2)", letterSpacing: "var(--ls-tight)", margin: "16px 0 0" }}
          >
            Envoy primitives
          </h1>
          <p className="muted" style={{ maxWidth: 560, marginTop: 14 }}>
            Every reusable piece of the Envoy visual vocabulary, rendered once. The marketing
            landing and the product app are both built from these.
          </p>

          <Group title="Buttons">
            <Button href="#">Get Started</Button>
            <Button variant="ghost" href="#">
              Sign in
            </Button>
            <Button>
              Approve &amp; copy
              <Icon icon={ArrowRight} size={16} />
            </Button>
            <Button variant="ghost">Regenerate</Button>
          </Group>

          <Group title="Labels">
            <Eyebrow>Now in early access</Eyebrow>
            <Pill>
              <Icon icon={Sparkles} size={13} />
              Demo data
            </Pill>
            <Tag>React</Tag>
            <Tag>TypeScript</Tag>
            <Tag>Remote</Tag>
          </Group>

          <Group title="Card">
            <Card style={{ maxWidth: 320 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon icon={Users} />
                <strong>Who to contact</strong>
              </div>
              <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
                A generic surface card with a line border and 22px radius.
              </p>
            </Card>
          </Group>

          <Group title="Gradient art">
            {ART_VARIANTS.map((variant) => (
              <div key={variant} style={{ width: 180 }}>
                <GradientArt variant={variant} />
                <p className="faint" style={{ fontSize: 13, marginTop: 8 }}>
                  art--{variant}
                </p>
              </div>
            ))}
          </Group>

          <Group title="Icons">
            <Icon icon={ArrowRight} />
            <Icon icon={Sparkles} />
            <Icon icon={Mail} />
            <Icon icon={Users} />
          </Group>
        </Container>
      </Section>
    </main>
  );
}
