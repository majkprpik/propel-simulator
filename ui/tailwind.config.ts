import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        facebook: { DEFAULT: '#1877F2', dark: '#0d5ecf' },
        google: { DEFAULT: '#4285F4', dark: '#2d6fd6' },
        tiktok: { DEFAULT: '#00F2EA', dark: '#00d4cd' },
        newsbreak: { DEFAULT: '#E53E3E', dark: '#c53030' },
        snapchat: { DEFAULT: '#FFFC00', dark: '#e6e300' },
        everflow: { DEFAULT: '#6366F1', dark: '#4f46e5' },
        shopify: { DEFAULT: '#96BF48', dark: '#7a9e35' },
        clickbank: { DEFAULT: '#C8A951', dark: '#a88c3d' },
        cake: { DEFAULT: '#F97316', dark: '#EA6B10' },
        hasoffers: { DEFAULT: '#0EA5E9', dark: '#0284C7' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
