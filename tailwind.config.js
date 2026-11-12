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
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          sunken:  'hsl(var(--surface-sunken))',
        },
        action: {
          DEFAULT: 'hsl(var(--action))',
          hover:   'hsl(var(--action-hover))',
        },
        danger: 'hsl(var(--danger))',
        sticker: {
          DEFAULT: 'hsl(var(--sticker))',
          ink:     'hsl(var(--sticker-ink))',
        },
        'text-primary':   'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-hint':      'hsl(var(--text-hint))',
        brand: 'hsl(var(--brand))',
      },
      fontFamily: {
        sans: ['Hanken Grotesk Variable', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        display: ['var(--fs-display)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        title:   ['var(--fs-title)',   { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        body:    ['var(--fs-body)',    { lineHeight: '1.5' }],
        label:   ['var(--fs-label)',   { lineHeight: '1.35' }],
        meta:    ['var(--fs-meta)',    { lineHeight: '1.35' }],
      },
      boxShadow: {
        raised: 'var(--shadow-raised)',
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
