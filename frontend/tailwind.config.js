import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        neon: {
          DEFAULT: 'oklch(var(--neon))',
          50: 'oklch(var(--neon) / 0.05)',
          100: 'oklch(var(--neon) / 0.1)',
          200: 'oklch(var(--neon) / 0.2)',
          300: 'oklch(var(--neon) / 0.3)',
          400: 'oklch(var(--neon) / 0.4)',
          500: 'oklch(var(--neon) / 0.5)',
          600: 'oklch(var(--neon) / 0.6)',
          700: 'oklch(var(--neon) / 0.7)',
          800: 'oklch(var(--neon) / 0.8)',
          900: 'oklch(var(--neon) / 0.9)',
        },
        surface: {
          DEFAULT: 'oklch(var(--surface))',
          elevated: 'oklch(var(--surface-elevated))',
        },
        primary: {
          DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))',
        },
        chart: {
          1: 'oklch(var(--chart-1))',
          2: 'oklch(var(--chart-2))',
          3: 'oklch(var(--chart-3))',
          4: 'oklch(var(--chart-4))',
          5: 'oklch(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar))',
          foreground: 'oklch(var(--sidebar-foreground))',
          primary: 'oklch(var(--sidebar-primary))',
          'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
          accent: 'oklch(var(--sidebar-accent))',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
          border: 'oklch(var(--sidebar-border))',
          ring: 'oklch(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
        neon: '0 0 20px oklch(0.88 0.22 130 / 0.4), 0 0 40px oklch(0.88 0.22 130 / 0.15)',
        'neon-sm': '0 0 12px oklch(0.88 0.22 130 / 0.25), 0 4px 20px rgba(0,0,0,0.5)',
        'neon-lg': '0 0 24px oklch(0.88 0.22 130 / 0.55), 0 0 60px oklch(0.88 0.22 130 / 0.25), 0 4px 20px rgba(0,0,0,0.6)',
        'neon-btn': '0 0 12px rgba(200,255,0,0.5), 0 0 28px rgba(200,255,0,0.25), 0 2px 8px rgba(0,0,0,0.6)',
        'neon-card': '0 0 0 1px rgba(200,255,0,0.45), 0 0 16px rgba(200,255,0,0.28), 0 0 32px rgba(200,255,0,0.1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'neon-pulse': {
          '0%, 100%': {
            textShadow: '0 0 8px #c8ff00, 0 0 20px #c8ff00, 0 0 40px rgba(200,255,0,0.6)',
          },
          '50%': {
            textShadow: '0 0 4px #c8ff00, 0 0 12px #c8ff00, 0 0 24px rgba(200,255,0,0.3)',
          },
        },
        'neon-btn-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 12px rgba(200,255,0,0.5), 0 0 28px rgba(200,255,0,0.25), 0 2px 8px rgba(0,0,0,0.6)',
          },
          '50%': {
            boxShadow: '0 0 18px rgba(200,255,0,0.7), 0 0 40px rgba(200,255,0,0.35), 0 2px 8px rgba(0,0,0,0.6)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'neon-pulse': 'neon-pulse 2.8s ease-in-out infinite',
        'neon-btn-pulse': 'neon-btn-pulse 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
