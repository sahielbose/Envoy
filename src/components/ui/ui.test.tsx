import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArrowRight } from "lucide-react";
import { Button, Eyebrow, Pill, Tag, Card, Container, Section, GradientArt, Icon } from "./index";

describe("Button", () => {
  it("renders a <button> by default", () => {
    render(<Button>Click</Button>);
    const el = screen.getByRole("button", { name: "Click" });
    expect(el.tagName).toBe("BUTTON");
    expect(el).toHaveClass("btn");
  });

  it("renders an <a> when given an href", () => {
    render(<Button href="/x">Go</Button>);
    const el = screen.getByRole("link", { name: "Go" });
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/x");
  });

  it("applies the ghost modifier", () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button", { name: "Ghost" })).toHaveClass("btn--ghost");
  });
});

describe("small surfaces", () => {
  it("Eyebrow renders children with .eyebrow", () => {
    render(<Eyebrow>Now in early access</Eyebrow>);
    expect(screen.getByText("Now in early access")).toHaveClass("eyebrow");
  });

  it("Pill, Tag, Card, Container, Section render their classes", () => {
    const { container } = render(
      <Section>
        <Container>
          <Card>
            <Pill>pill</Pill>
            <Tag>React</Tag>
          </Card>
        </Container>
      </Section>,
    );
    expect(screen.getByText("pill")).toHaveClass("pill");
    expect(screen.getByText("React")).toHaveClass("tag");
    expect(container.querySelector(".card")).toBeInTheDocument();
    expect(container.querySelector(".container")).toBeInTheDocument();
    expect(container.querySelector("section.section")).toBeInTheDocument();
  });
});

describe("GradientArt", () => {
  it("applies the variant + grain classes and is decorative", () => {
    const { container } = render(<GradientArt variant="violet" />);
    const art = container.querySelector(".art");
    expect(art).toHaveClass("art--violet", "grain");
    expect(art).toHaveAttribute("aria-hidden", "true");
  });

  it("can disable grain", () => {
    const { container } = render(<GradientArt variant="nebula" grain={false} />);
    expect(container.querySelector(".art")).not.toHaveClass("grain");
  });
});

describe("Icon", () => {
  it("renders an svg", () => {
    const { container } = render(<Icon icon={ArrowRight} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
