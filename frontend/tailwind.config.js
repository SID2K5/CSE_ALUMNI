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
        /* ---- Spec tokens (canonical) ---- */
        bg: "var(--bg)",
        "bg-secondary": "var(--bg-secondary)",
        surface: "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        divider: "var(--divider)",

        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },

        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          active: "var(--primary-active)",
          soft: "var(--primary-soft)",
          contrast: "var(--primary-contrast)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          soft: "var(--accent-soft)",
        },

        success: { DEFAULT: "var(--success)", soft: "var(--success-soft)" },
        warning: { DEFAULT: "var(--warning)", soft: "var(--warning-soft)" },
        danger: { DEFAULT: "var(--danger)", soft: "var(--danger-soft)" },
        info: { DEFAULT: "var(--info)", soft: "var(--info-soft)" },
        verified: "var(--verified)",

        /* ---- Fixed dark sidebar (same in both themes) ---- */
        sidebar: {
          bg: "var(--sidebar-bg)",
          surface: "var(--sidebar-surface)",
          hover: "var(--sidebar-hover)",
          active: "var(--sidebar-active)",
          border: "var(--sidebar-border)",
          text: "var(--sidebar-text)",
          "text-secondary": "var(--sidebar-text-secondary)",
          icon: "var(--sidebar-icon)",
          "icon-active": "var(--sidebar-icon-active)",
        },

        /* ---- Legacy aliases: keep existing component classes working.
               These resolve to the spec tokens via index.css. ---- */
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        "surface-2": "var(--surface-2)",
        brand: {
          DEFAULT: "var(--brand)",
          2: "var(--brand-2)",
          soft: "var(--brand-soft)",
          ink: "var(--brand-ink)",
        },
        "nav-bg": "var(--nav-bg)",
        "nav-ink": "var(--nav-ink)",
      },
      borderRadius: {
        // Spec scale: 10 input/button · 14 card · 16 featured · 18 modal
        md: "10px",
        lg: "14px",
        xl: "16px",
        "2xl": "18px",
        "3xl": "22px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        elevated: "var(--shadow-elevated)",
        ring: "0 0 0 1px var(--border)",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-lavender": "var(--gradient-lavender)",
      },
      maxWidth: {
        content: "680px",
        shell: "1280px",
      },
      transitionDuration: {
        DEFAULT: "160ms",
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
