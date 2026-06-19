"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          background: "#f4eee5",
          color: "#2b2117",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontWeight: 500 }}>Something went wrong</h1>
          <p>That didn&apos;t load. Try again.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#2b2117",
              color: "#f7f3eb",
              border: 0,
              padding: "12px 22px",
              borderRadius: 11,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
