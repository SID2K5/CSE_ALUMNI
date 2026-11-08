/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: ["Sora", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Semantic tokens — resolve to CSS variables that flip in dark mode.
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--line)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        brand: {
          DEFAULT: "var(--brand)",
          2: "var(--brand-2)",
          soft: "var(--brand-soft)",
        },
        // Kept for backwards compatibility with existing utilities.
        primary: "#7C3AED",
        secondary: "#06B6D4",
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "26px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)",
        "card-hover": "0 2px 6px rgba(15,23,42,0.06), 0 16px 40px rgba(15,23,42,0.10)",
        ring: "0 0 0 1px var(--line)",
      },
      maxWidth: {
        content: "680px",
        shell: "1280px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease both",
      },
    },
  },
  plugins: [],
};
