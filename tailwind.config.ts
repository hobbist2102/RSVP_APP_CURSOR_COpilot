import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      borderRadius: {
        'none': '0',
        'sm': '6px',
        DEFAULT: '0.75rem',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-text-primary)",
        surface: "var(--color-surface)",
        
        primary: {
          DEFAULT: "var(--color-accent-purple)",
          foreground: "#ffffff",
        },

        accent: {
          DEFAULT: "var(--color-accent-gold)",
          foreground: "#ffffff",
        },

        secondary: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-text-secondary)",
        },
        
        muted: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-text-secondary)",
        },
        
        border: "var(--color-border)",
        ring: "var(--color-accent-purple)",
        
        // Glass effect utilities
        glass: {
          light: "var(--glass-bg)",
          dark: "var(--glass-bg)",
        },
        
        // Status colors for pills
        status: {
          confirmed: "#059669",
          declined: "#DC2626", 
          pending: "#D97706",
        },
        
        card: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-text-primary)",
        },
        
        popover: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-text-primary)",
        },

        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },

        chart: {
          "1": "#5E239D",
          "2": "#8b5cf6",
          "3": "#a78bfa",
          "4": "#c4b5fd",
          "5": "#ddd6fe",
        },

        sidebar: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-text-primary)",
          primary: "#5E239D",
          "primary-foreground": "#ffffff",
          accent: "rgba(94, 35, 157, 0.1)",
          "accent-foreground": "#5E239D",
          border: "var(--color-border)",
          ring: "#5E239D",
        },
      },
      
      backdropBlur: {
        'ios': '12px',
        'ios-dark': '10px',
      },
      
      boxShadow: {
        'glass': '0 6px 20px rgba(0, 0, 0, 0.15)',
        'glass-dark': '0 6px 20px rgba(0, 0, 0, 0.3)',
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-1": {
          "0%, 100%": { transform: "translateY(0) rotate(0)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        "float-2": {
          "0%, 100%": { transform: "translateY(0) rotate(0)" },
          "50%": { transform: "translateY(-12px) rotate(-1deg)" },
        },
        "float-3": {
          "0%, 100%": { transform: "translateY(0) rotate(0)" },
          "50%": { transform: "translateY(-8px) rotate(2deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.3s ease-out",
        scaleIn: "scaleIn 0.2s ease-out",
        slideUp: "slideUp 0.3s ease-out",
        "float-1": "float-1 6s ease-in-out infinite",
        "float-2": "float-2 8s ease-in-out infinite", 
        "float-3": "float-3 10s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;