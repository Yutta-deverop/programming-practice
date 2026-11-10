import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2-rgb) / <alpha-value>)",
        foreground: "rgb(var(--foreground-rgb) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--muted-rgb) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground-rgb) / <alpha-value>)",
        },
        border: "rgb(var(--border-rgb) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong-rgb) / <alpha-value>)",
        ring: "rgb(var(--ring-rgb) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary-rgb) / <alpha-value>)",
          hover: "rgb(var(--primary-hover-rgb) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground-rgb) / <alpha-value>)",
          soft: "rgb(var(--primary-soft-rgb) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          soft: "rgb(var(--accent-soft-rgb) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground-rgb) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success-rgb) / <alpha-value>)",
          soft: "rgb(var(--success-soft-rgb) / <alpha-value>)",
          foreground: "rgb(var(--success-foreground-rgb) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning-rgb) / <alpha-value>)",
          soft: "rgb(var(--warning-soft-rgb) / <alpha-value>)",
          foreground: "rgb(var(--warning-foreground-rgb) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger-rgb) / <alpha-value>)",
          soft: "rgb(var(--danger-soft-rgb) / <alpha-value>)",
          foreground: "rgb(var(--danger-foreground-rgb) / <alpha-value>)",
        },
        code: {
          background: "rgb(var(--code-background-rgb) / <alpha-value>)",
          text: "rgb(var(--code-text-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Hiragino Sans", "Noto Sans JP", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "10px",
        lg: "16px",
        xl: "22px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(17, 24, 39, 0.06)",
        md: "0 6px 20px -8px rgba(17, 24, 39, 0.18)",
        lg: "0 18px 50px -20px rgba(17, 24, 39, 0.28)",
      },
      maxWidth: {
        content: "1180px",
        prose: "68ch",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
