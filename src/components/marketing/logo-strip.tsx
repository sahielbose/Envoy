/** "Job seekers using Envoy have landed at" + neutral, fictional wordmarks. */
export function LogoStrip() {
  return (
    <section className="logos container">
      <div className="logos__row">
        <span className="logos__label">Job seekers using Envoy have landed at</span>
        <span className="wm">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 21 12 3l9 18z" />
          </svg>
          Northwind
        </span>
        <span className="wm">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z" />
          </svg>
          Lumen
        </span>
        <span className="wm">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2 22 8v8l-10 6L2 16V8z" />
          </svg>
          Cobalt
        </span>
        <span className="wm">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
          </svg>
          Fathom
        </span>
      </div>
    </section>
  );
}
