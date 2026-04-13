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
        "primary": "var(--primary)",
        "on-primary": "var(--on-primary)",
        "primary-container": "var(--primary-container)",
        "on-primary-container": "var(--on-primary-container)",
        
        "secondary": "var(--secondary)",
        "on-secondary": "var(--on-secondary)",
        "secondary-container": "var(--secondary-container)",
        "on-secondary-container": "var(--on-secondary-container)",
        
        "tertiary": "var(--tertiary)",
        "on-tertiary": "var(--on-tertiary)",
        "tertiary-container": "var(--tertiary-container)",
        "on-tertiary-container": "var(--on-tertiary-container)",
        
        "error": "var(--error)",
        "on-error": "var(--on-error)",
        "error-container": "var(--error-container)",
        "on-error-container": "var(--on-error-container)",
        
        "background": "var(--background)",
        "on-background": "var(--on-background)",
        
        "surface": "var(--surface)",
        "on-surface": "var(--on-surface)",
        "surface-variant": "var(--surface-variant)",
        "on-surface-variant": "var(--on-surface-variant)",
        
        "outline": "var(--outline)",
        "outline-variant": "var(--outline-variant)",
        
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        
        // Legacy/Derived aliases if needed
        "surface-bright": "#f7f9ff",
        "surface-tint": "#0060ac",
        "on-tertiary-fixed-variant": "#692984",
        "on-secondary-fixed-variant": "#005228",
        "inverse-primary": "#a4c9ff",
        "surface-dim": "#c9dcf3",
        "primary-fixed": "#d4e3ff",
        "tertiary-fixed": "#f8d8ff",
        "on-tertiary-fixed": "#320047",
        "tertiary-fixed-dim": "#ebb2ff",
        "secondary-fixed": "#7efba4",
        "inverse-surface": "#203243",
        "primary-fixed-dim": "#a4c9ff",
        "on-primary-fixed": "#001c39",
        "secondary-fixed-dim": "#61de8a",
        "on-primary-fixed-variant": "#004883",
        "on-secondary-fixed": "#00210c",
        "inverse-on-surface": "#e8f2ff",
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
      },
      boxShadow: {
        'glass-dark': 'inset 0 1px 2px rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.3)',
        'glow-primary': '0 0 24px rgba(75, 168, 244, 0.3)',
        'glow-secondary': '0 0 24px rgba(45, 212, 164, 0.3)',
        'glow-error': '0 0 24px rgba(255, 107, 107, 0.3)',
      },
      backdropFilter: {
        'blur-xl': 'blur(16px)',
        'blur-2xl': 'blur(20px)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 24px rgba(75, 168, 244, 0.2)' },
          '50%': { boxShadow: '0 0 32px rgba(75, 168, 244, 0.4)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      }
    },
  },
  plugins: [
    forms,
  ],
}
