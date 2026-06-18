import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Envoy — Get in front of your dream company",
  description:
    "Envoy is your AI career super-connector. It finds the roles you deserve, maps the right people to reach, and drafts outreach that sounds like you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
