import type { Config } from "tailwindcss";

export default {
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
        DEFAULT: '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
      colors: {
        // Apple iOS 18 color system
        background: "var(--color-background)",
        foreground: "var(--color-text-primary)",
        
        // Glass surfaces
        glass: {
          DEFAULT: "var(--glass-bg)",
          light: "rgba(255, 255, 255, 0.6)",
          dark: "rgba(30, 30, 30, 0.5)",
        },

        // Primary purple accent
        primary: {
          DEFAULT: "#5E239D",
          50: "#f5f3ff",
          100: "#ede9fe", 
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#5E239D",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
          foreground: "#ffffff",
        },

        // Gold accent
        gold: {
          DEFAULT: "#BFA76F",
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#BFA76F",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
          950: "#422006",
        },

        // Semantic colors
        secondary: {
          DEFAULT: "var(--color-text-secondary)",
          foreground: "var(--color-text-primary)",
        },
        
        muted: {
          DEFAULT: "rgba(0, 0, 0, 0.05)",
          foreground: "var(--color-text-secondary)",
        },
        
        accent: {
          DEFAULT: "#5E239D",
          foreground: "#ffffff",
        },

        // Status colors
        success: {
          DEFAULT: "#22c55e",
          foreground: "#ffffff",
        },
        
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
        
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },

        // UI elements
        border: "var(--color-border)",
        input: "var(--glass-bg)",
        ring: "#5E239D",
        
        // Card colors
        card: {
          DEFAULT: "var(--glass-bg)",
          foreground: "var(--color-text-primary)",
        },
        
        popover: {
          DEFAULT: "var(--glass-bg)",
          foreground: "var(--color-text-primary)",
        },

        // Chart colors (purple variations)
        chart: {
          "1": "#5E239D",
          "2": "#8b5cf6",
          "3": "#a78bfa",
          "4": "#c4b5fd",
          "5": "#ddd6fe",
        },

        // Sidebar colors
        sidebar: {
          DEFAULT: "var(--glass-bg)",
          foreground: "var(--color-text-primary)",
          primary: "#5E239D",
          "primary-foreground": "#ffffff",
          accent: "rgba(94, 35, 157, 0.1)",
          "accent-foreground": "#5E239D",
          border: "var(--color-border)",
          ring: "#5E239D",
        },
      },
      
      // Backdrop blur utilities
      backdropBlur: {
        'ios': '12px',
        'ios-dark': '10px',
      },

      // Box shadows for glassmorphism
      boxShadow: {
        'glass': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 4px 16px rgba(0, 0, 0, 0.3)',
        'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'purple': '0 2px 8px rgba(94, 35, 157, 0.25)',
        'purple-hover': '0 4px 16px rgba(94, 35, 157, 0.3)',
        'gold': '0 2px 8px rgba(191, 167, 111, 0.25)',
      },
      keyframes: {
        // Existing shadcn animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        
        // Apple iOS style animations
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "glass-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        
        // Floating animations for decorative elements
        "float-1": {
          "0%, 100%": { transform: "translateY(0) rotate(0)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        "float-2": {
          "0%, 100%": { transform: "translateY(0) rotate(0)" },
          "50%": { transform: "translateY(-15px) rotate(-3deg)" },
        },
        "float-3": {
          "0%, 100%": { transform: "translateY(0) rotate(0)" },
          "50%": { transform: "translateY(-8px) rotate(2deg)" },
        },
      },
      
      animation: {
        // Existing shadcn animations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        
        // Apple iOS style animations
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "glass-shimmer": "glass-shimmer 2s infinite linear",
        
        // Floating animations
        "float-1": "float-1 6s ease-in-out infinite",
        "float-2": "float-2 8s ease-in-out infinite", 
        "float-3": "float-3 10s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
