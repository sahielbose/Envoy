import type { Config } from "tailwindcss";

// Envoy design tokens — see docs/ENVOY_UI.md (mirrors design/landing.html).
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F4EEE5",
        "bg-alt": "#EFE7DB",
        ink: "#2B2117",
        "ink-soft": "#6E665A",
        "ink-faint": "#A89E8D",
        surface: "#ECE4D7",
        "surface-2": "#E7DECF",
        cream: "#F7F3EB",
        violet: "#A99BD9",
        amber: "#E7B45C",
        sage: "#9FB587",
        rose: "#E0A6A0",
      },
      fontFamily: {
        serif: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: { card: "22px", btn: "11px" },
      maxWidth: { content: "1180px" },
    },
  },
  plugins: [],
};
export default config;
