/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'bg-app':         'hsl(var(--bg-app))',
        'text-primary':   'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-hint':      'hsl(var(--text-hint))',
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          deep:    'hsl(var(--brand-deep))',
        },
        coral:  'hsl(var(--coral))',
        mint:   'hsl(var(--mint))',
        yellow: 'hsl(var(--yellow))',
      },
      backdropBlur: { xs: '8px' },
      boxShadow: {
        'glass-sm':          '0 3px 12px hsl(var(--brand) / 0.06)',
        'glass-md':          '0 6px 18px hsl(var(--brand) / 0.12)',
        'glass-button':      '0 6px 16px hsl(var(--brand) / 0.25)',
        'glass-card-purple': '0 8px 24px hsl(var(--brand) / 0.22)',
      },
      keyframes: {
        'blob-morph': {
          '0%, 100%': { borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%', transform: 'rotate(0deg) scale(1)' },
          '33%':      { borderRadius: '60% 40% 35% 65% / 60% 35% 65% 40%', transform: 'rotate(10deg) scale(1.06)' },
          '66%':      { borderRadius: '45% 55% 70% 30% / 35% 60% 40% 65%', transform: 'rotate(-8deg) scale(0.96)' },
        },
      },
      animation: { 'blob-morph': 'blob-morph 2s ease-in-out infinite' },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
