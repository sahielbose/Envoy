import { Button } from "@/components/ui";

/** Big centered marketing footer. */
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__logo">Envoy</div>
        <p className="footer__tag">Get in front of your dream company</p>
        <Button href="/onboarding">Get Started</Button>
        <div className="footer__legal container">© 2026 Envoy. All rights reserved.</div>
      </div>
    </footer>
  );
}
