import Link from "next/link";

export default function NotFound() {
  return (
    <div className="center-state">
      <div>
        <div className="footer__logo" style={{ fontSize: 48 }}>
          Envoy
        </div>
        <p className="muted">We couldn&apos;t find that page.</p>
        <Link href="/" className="btn">
          Back home
        </Link>
      </div>
    </div>
  );
}
