import { Button } from "@/components/ui";

/** Sticky top nav: centered Envoy wordmark, ghost "Sign in" + "Get Started". */
export function Nav() {
  return (
    <header className="nav">
      <div className="container nav__inner">
        <div className="nav__logo">Envoy</div>
        <nav className="nav__right" aria-label="Primary">
          <Button variant="ghost" href="#">
            Sign in
          </Button>
          <Button href="#">Get Started</Button>
        </nav>
      </div>
    </header>
  );
}
