import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter UI', 'sans-serif'],  // EXACT MATCH
        serif: ['Cormorant', 'serif'],     // EXACT MATCH  
        display: ['Inter UI', 'sans-serif'], // EXACT MATCH
      },
      borderRadius: {
        'none': '0px',     // FORCE FLAT
        'sm': '0px',       // FORCE FLAT
        DEFAULT: '0px',    // FORCE FLAT
        'md': '0px',       // FORCE FLAT
        'lg': '0px',       // FORCE FLAT
        'xl': '0px',       // FORCE FLAT
        '2xl': '0px',      // FORCE FLAT
        'full': '0px',     // FORCE FLAT (NO PILLS)
      },
      boxShadow: {
        'none': 'none',
        'sm': '0px 0px 0px 0px hsl(0 0% 0% / 0.00)',              // FORCE FLAT
        DEFAULT: '0px 0px 0px 0px hsl(0 0% 0% / 0.00)',           // FORCE FLAT
        'md': '0px 0px 0px 0px hsl(0 0% 0% / 0.00)',              // FORCE FLAT
        'lg': '0px 0px 0px 0px hsl(0 0% 0% / 0.00)',              // FORCE FLAT
        'xl': '0px 0px 0px 0px hsl(0 0% 0% / 0.00)',              // FORCE FLAT
        '2xl': '0px 0px 0px 0px hsl(0 0% 0% / 0.00)',             // FORCE FLAT
        'inner': 'none',                                          // FORCE FLAT
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
          500: "#E3C76F",
          600: "#d4b054",
          700: "#b0923e",
          800: "#8f7533",
          900: "#765f2d",
          foreground: "#1f1f1f",
        },
      },

      // REMOVE BACKDROP BLUR - FLAT DESIGN
      backdropBlur: {
        'none': 'none',  // FORCE NO BLUR
        'ios': '12px',
        'ios-dark': '10px',
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
        // REMOVE SCALE ANIMATIONS - FLAT DESIGN
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
        // REMOVE FLOATING ANIMATIONS - FLAT DESIGN
      },
      borderWidth: {
        '3': '3px',
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    // Add plugin to force flat design
    function({ addUtilities }: any) {
      const flatUtilities = {
        '.flat': {
          'border-radius': '0px !important',
          'box-shadow': 'none !important',
        },
        '.no-transform': {
          'transform': 'none !important',
        },
        '.no-hover-transform:hover': {
          'transform': 'none !important',
        },
      }
      addUtilities(flatUtilities)
    }
  ],
};

export default config;