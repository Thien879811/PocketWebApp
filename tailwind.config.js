import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-bright": "#f7f9ff",
        "surface-tint": "#0060ac",
        "on-tertiary-fixed-variant": "#692984",
        "outline-variant": "#c1c7d3",
        "background": "#f7f9ff",
        "on-secondary-fixed-variant": "#005228",
        "inverse-primary": "#a4c9ff",
        "surface-container": "#e3efff",
        "on-error-container": "#93000a",
        "primary-fixed": "#d4e3ff",
        "primary": "#005da7",
        "surface-dim": "#c9dcf3",
        "tertiary-fixed": "#f8d8ff",
        "on-tertiary-container": "#fffbff",
        "on-tertiary-fixed": "#320047",
        "tertiary-fixed-dim": "#ebb2ff",
        "secondary-fixed": "#7efba4",
        "error": "#ba1a1a",
        "on-secondary-container": "#007239",
        "tertiary-container": "#9b59b6",
        "surface": "#f7f9ff",
        "surface-variant": "#d1e4fb",
        "surface-container-low": "#edf4ff",
        "on-background": "#091d2e",
        "tertiary": "#80409b",
        "surface-container-highest": "#d1e4fb",
        "inverse-surface": "#203243",
        "surface-container-high": "#d9eaff",
        "on-error": "#ffffff",
        "on-tertiary": "#ffffff",
        "on-primary": "#ffffff",
        "primary-fixed-dim": "#a4c9ff",
        "outline": "#717783",
        "on-surface": "#091d2e",
        "on-primary-fixed": "#001c39",
        "on-primary-container": "#fdfcff",
        "primary-container": "#2976c7",
        "secondary-fixed-dim": "#61de8a",
        "secondary": "#006d37",
        "on-secondary": "#ffffff",
        "secondary-container": "#7bf8a1",
        "on-surface-variant": "#414751",
        "error-container": "#ffdad6",
        "on-primary-fixed-variant": "#004883",
        "on-secondary-fixed": "#00210c",
        "inverse-on-surface": "#e8f2ff",
        "surface-container-lowest": "#ffffff"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "full": "9999px"
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "1", fontWeight: "800" }],
        "headline-sm": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "700" }],
        "label-sm": ["0.75rem", { lineHeight: "1rem", fontWeight: "500", letterSpacing: "0.05em" }],
        "body-md": ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
      }
    },
  },
  plugins: [
    forms,
  ],
}
