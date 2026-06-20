# Spec 057 — App dark mode with OS preference and theme toggle

| Field    | Value                                                                                |
| -------- | ------------------------------------------------------------------------------------ |
| Issue    | [#57](https://github.com/andrenxx/dumpit/issues/57)                                 |
| Branch   | `feat/57-app-has-no-dark-mode-os-preference-ignor`                                  |
| Status   | Draft — awaiting review                                                              |
| Type     | feature                                                                              |

## 1. Context

The app renders the same light palette regardless of the user's OS preference
(`prefers-color-scheme: dark`) and offers no manual toggle. Users who work in dark
environments see full-brightness backgrounds at night. The issue has been surfaced as
#57 and links to issue #48 (dual token system), which this spec resolves as a
prerequisite.

There are currently three competing token sources that must be unified before any
dark mode can work reliably:

1. **Legacy hex vars** in `src/index.css` `:root {}` (`--bg-app: #FAF8F4`, `--brand: #2B1C9A`, etc.)
2. **shadcn HSL vars** in the same `:root {}` block (`--background: 38 33% 97%`, etc.)
3. **Hardcoded hex in `tailwind.config.js`** (`'bg-app': '#FAF9FC'`, `brand: { DEFAULT: '#5B3DF2' }`, etc.)

There is a mismatch between source #1 and source #3 for several tokens already
(`--bg-app: #FAF8F4` vs `'bg-app': '#FAF9FC'`, `--brand: #2B1C9A` vs `brand: '#5B3DF2'`).
This spec consolidates everything to HSL CSS vars and eliminates all hardcoded hex from
Tailwind config.

## 2. Goals

- The app reads `prefers-color-scheme` on first load and sets the initial theme accordingly.
- A manual toggle in the profile drawer persists the user's choice to `localStorage`.
- `localStorage` preference takes precedence over OS preference on subsequent loads.
- Switching themes is smooth: a 200 ms CSS transition covers background, text, and border surfaces.
- No flash-of-wrong-theme (FAWT): the initial theme class is applied before the first paint via a `.theme-ready` guard on `<html>`.
- All three token sources are unified under a single set of HSL CSS vars; no hex appears in `tailwind.config.js` after this PR.
- Issue #48 (dual token conflict) is closed by this work.

## 2.5 Validation strategy

Three manual verification flows (no automated tests required at this scope):

1. **Toggle round-trip:** open the app in a browser, click the theme toggle in the profile drawer, confirm every visible surface (background, cards, text, border, brand color, bottom nav, top bar, blob, toast) switches without flash or layout shift.
2. **Persistence:** after toggling to dark, close and reopen the tab — app must open in dark mode. Toggle back to light, close, reopen — app must open in light mode.
3. **OS-preference default:** clear `localStorage`, switch OS to dark, open the app — app must render in dark. Switch OS to light, open — app renders in light.

Transition smoothness is verified by eye during flow 1: a 200 ms ease must be visible on background surfaces; Framer Motion page transitions must not flicker (the transition is on CSS properties only, not opacity/transform).

FAWT is verified by hard-refreshing (Ctrl+Shift+R) in dark mode: background must be dark before JS hydration populates any content.

## 3. Non-goals

- Per-surface dark overrides beyond the token swap (no special dark images, dark illustrations, or dark blob colors at this stage).
- A scheduled "auto dark at sunset" feature.
- A dark mode option on the landing page (`/`) — only the authenticated shell (`/dashboard`) is in scope.
- TypeScript migration or shadcn component upgrades.
- The palette swap (indigo → teal) from issue #58 — that is a separate spec, blocked on this one shipping.
- Saving theme preference to the user's Supabase profile — `localStorage` is the persistence layer for this spec. Supabase sync (so preference follows the user across devices) is deferred to a future spec.

## 4. Design

### 4.1 Tailwind config — `darkMode: 'class'`

Add `darkMode: 'class'` at the top of the config object. Convert every hardcoded hex
value to `hsl(var(--*))` to let the CSS layer control values:

```js
// tailwind.config.js (after)
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // shadcn slots — already HSL, unchanged
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary:    { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        muted:      { DEFAULT: 'hsl(var(--muted))',   foreground: 'hsl(var(--muted-foreground))' },
        accent:     { DEFAULT: 'hsl(var(--accent))',  foreground: 'hsl(var(--accent-foreground))' },
        card:       { DEFAULT: 'hsl(var(--card))',    foreground: 'hsl(var(--card-foreground))' },
        // DumpIt custom tokens — converted to HSL vars
        'bg-app':         'hsl(var(--bg-app))',
        'text-primary':   'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-hint':      'hsl(var(--text-hint))',
        brand:  { DEFAULT: 'hsl(var(--brand))', deep: 'hsl(var(--brand-deep))' },
        coral:  'hsl(var(--coral))',
        mint:   'hsl(var(--mint))',
        yellow: 'hsl(var(--yellow))',
      },
      boxShadow: {
        // rgba shadows reference CSS vars via the channel trick
        'glass-sm':          '0 3px 12px hsl(var(--brand) / 0.06)',
        'glass-md':          '0 6px 18px hsl(var(--brand) / 0.12)',
        'glass-button':      '0 6px 16px hsl(var(--brand) / 0.25)',
        'glass-card-purple': '0 8px 24px hsl(var(--brand) / 0.22)',
      },
      // backdropBlur, keyframes, animation, borderRadius unchanged
    },
  },
  plugins: [],
}
```

### 4.2 Token consolidation in `src/index.css`

Replace the three-source mix with a single authoritative `:root {}` block using HSL
channel values only (no `hsl()` wrapper in the var itself — Tailwind's `hsl(var(--*))` adds it).

Light palette (`:root {}`):

```css
:root {
  /* layout surfaces */
  --bg-app:         270 33% 99%;   /* #FAF9FC */
  --bg-card:        0   0%  100%;  /* #FFFFFF */
  --bg-accent-light: 252 100% 95%; /* #EEEAFF */

  /* text */
  --text-primary:   252 36% 14%;   /* #1A1530 */
  --text-secondary: 249 13% 41%;   /* #5E5878 */
  --text-hint:      252 23% 71%;   /* #ACA4C8 */

  /* brand */
  --brand:          256 88% 59%;   /* #5B3DF2 */
  --brand-deep:     252 70% 50%;   /* #4427D6 */

  /* semantic colors */
  --coral:          14  100% 66%;  /* #FF6F52 */
  --mint:           163 100% 41%;  /* #00D2A0 */
  --yellow:         43  100% 64%;  /* #FFCB47 */

  /* borders */
  --border-default: 30  6%  92%;
  --border-strong:  30  8%  85%;

  /* shadcn slots */
  --background:       270 33% 99%;
  --foreground:       252 36% 14%;
  --card:             0 0% 100%;
  --card-foreground:  252 36% 14%;
  --primary:          256 88% 59%;
  --primary-foreground: 0 0% 100%;
  --muted:            25 14% 75%;
  --muted-foreground: 25 12% 49%;
  --accent:           256 88% 59%;
  --accent-foreground: 0 0% 100%;
  --border:           30 6% 92%;
  --input:            30 8% 87%;
  --radius:           0.625rem;
}
```

Dark palette overrides (`html.dark {}`):

```css
html.dark {
  --bg-app:         245 17% 13%;   /* #1B1A26 */
  --bg-card:        244 20% 18%;   /* #252338 */
  --bg-accent-light: 252 30% 22%;

  --text-primary:   248 100% 97%;  /* #EFECFF */
  --text-secondary: 249 22% 66%;   /* #9B94BD */
  --text-hint:      252 16% 39%;   /* #5A5475 */

  --brand:          256 88% 66%;   /* #7C5CF5 — lighter for dark bg */
  --brand-deep:     256 88% 59%;   /* same as light --brand */

  --border-default: 0 0% 100% / 0.08;
  --border-strong:  0 0% 100% / 0.14;

  /* shadcn dark slots */
  --background:     245 17% 13%;
  --foreground:     248 100% 97%;
  --card:           244 20% 18%;
  --card-foreground: 248 100% 97%;
  --primary:        256 88% 66%;
  --muted:          252 16% 29%;
  --muted-foreground: 249 22% 66%;
  --accent:         256 88% 66%;
  --border:         0 0% 100% / 0.08;
  --input:          0 0% 100% / 0.12;
}
```

Transition block — scoped to `.theme-ready` to prevent FAWT:

```css
html.theme-ready *,
html.theme-ready *::before,
html.theme-ready *::after {
  transition:
    background-color 200ms ease,
    color            200ms ease,
    border-color     200ms ease,
    box-shadow       200ms ease;
}
```

Remove the old `body { background: #FAF9FC; color: #1A1530; }` block and replace it
with a `body { background: hsl(var(--bg-app)); color: hsl(var(--text-primary)); }` rule.

The legacy `--bg-card`, `--bg-accent-light`, `--brand-hover`, `--brand-light`,
`--border-default`, `--border-strong`, and badge hex vars remain as hex in `:root` for
backwards compat and are separately addressed by the badge/border token migration that
will follow naturally during feature work. They are not removed in this PR.

### 4.3 `useTheme` hook — `src/hooks/useTheme.js`

```js
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'dumpit-theme'

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
    // Apply transition guard after first mount so initial paint is instant
    requestAnimationFrame(() => html.classList.add('theme-ready'))
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggle }
}
```

### 4.4 Toggle UI in profile drawer (`TopBar.jsx`)

Add a row in the profile drawer between "Perfil" header and the sign-out button.
Expose the hook from `AppShell` via a context or pass `toggle`/`theme` as props.
The simpler path (no extra context) is to call `useTheme()` directly inside
`TopBar` — the hook is lightweight and the drawer is already aware of user state.

The toggle is a pill row with a sun/moon icon that flips on click:

```jsx
// Inside TopBar — add to imports
import { useTheme } from '../../hooks/useTheme'

// Inside component body
const { theme, toggle } = useTheme()

// Inside the drawer's flex-1 section, above the sign-out button:
<button
  onClick={toggle}
  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[16px] mb-2"
  style={{
    background: 'rgba(91,61,242,0.06)',
    border: '1px solid rgba(91,61,242,0.10)',
    color: 'hsl(var(--text-primary))',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  }}
>
  <span className="flex items-center gap-2">
    <span style={{ fontSize: 15 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
    {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
  </span>
  <span style={{ opacity: 0.4, fontSize: 11 }}>
    {theme === 'dark' ? 'ativo: escuro' : 'ativo: claro'}
  </span>
</button>
```

Note: emoji icons are acceptable here since they are universally available and avoid
an icon library dependency. If the project adopts Lucide (or similar) later, swap them.

### 4.5 AppShell change (`App.jsx`)

`useTheme` is called in `TopBar` so `AppShell` itself requires no change. However,
`AppShell`'s root `<div>` currently uses `background: 'transparent'` via inline style,
which is correct — background is handled at the `body` and card level via CSS vars.

No change needed to `App.jsx`.

## 4.5 UX decision

**Options considered** (from discovery #57):

- A: OS preference only — no toggle, honor `prefers-color-scheme` only. Zero UI cost; users cannot override.
- B: Toggle with instant switch — `darkMode: 'class'`, toggle in drawer, no transition. Simple but jarring on slow surfaces.
- C: Toggle + smooth 200 ms CSS transition guarded by `.theme-ready` — the full experience.

**Chosen**: C

**Rationale**: Option A was rejected because users in mixed environments (personal dark, shared-screen light) need to override. Option B was rejected because instant background flips are visually harsh on glass/blur surfaces. Option C adds negligible implementation complexity and the `.theme-ready` guard eliminates FAWT — the only risk with transition-on-class-toggle. The 200 ms duration is short enough not to feel sluggish and long enough to register as intentional. Framer Motion transitions operate on `opacity`/`transform`, not the CSS properties in scope, so there is no interference.

**New tone-matrix rows proposed**: N/A — no new copy contexts introduced.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `tailwind.config.js` | modified | Add `darkMode: 'class'`; convert all hardcoded hex to `hsl(var(--*))` |
| `src/index.css` | modified | Add `html.dark {}` overrides; add `.theme-ready` transition block; unify `:root` HSL vars; fix `body` rule |
| `src/hooks/useTheme.js` | created | `useTheme` hook — localStorage + `prefers-color-scheme`, sets `.dark` and `.theme-ready` on `<html>` |
| `src/components/layout/TopBar.jsx` | modified | Add theme toggle button inside profile drawer |

## 6. Acceptance

- [ ] Toggling the button in the profile drawer switches the entire app between light and dark palettes without page reload.
- [ ] The switch is smooth (200 ms ease visible on background surfaces).
- [ ] Refreshing after toggling to dark reopens the app in dark mode.
- [ ] Refreshing after toggling to light reopens the app in light mode.
- [ ] With no `localStorage` entry, the app uses the OS preference (dark OS → dark app; light OS → light app).
- [ ] No flash of wrong theme on hard refresh in either mode (background color matches theme before content renders).
- [ ] No `hex` color values remain in `tailwind.config.js` after this PR.
- [ ] Issue #48 is closed (dual token conflict resolved).
- [ ] Framer Motion page transitions still work without flicker after the CSS transition block is added.
- [ ] The toggle label in the drawer reflects the current active theme ("Modo escuro" when dark, "Modo claro" when light).

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Glass surfaces use `rgba(255,255,255,0.*)` which don't invert automatically | Add `html.dark .glass-surface { background: rgba(30,28,50,0.55); }` overrides in `index.css` |
| Badge hex vars (`--badge-urgente-bg`, etc.) are not in scope and will look wrong in dark | Acceptable for this PR; tracked as follow-up. Badges use semantic background classes so can be overridden later without touching token system. |
| `requestAnimationFrame` delay for `.theme-ready` may be too fast on some browsers, causing transition on initial paint | Add a fallback: check if `document.readyState === 'complete'` before adding the class, else attach to `window.load`. In practice `rAF` fires after paint so this is low risk. |
| Token value drift — `:root` legacy hex vars (`--bg-app: #FAF8F4`, etc.) still exist and may shadow the new HSL vars | Remove the legacy hex var block entirely in this PR. The hardcoded hex on `body` references a *different* value anyway, confirming the drift is already causing bugs. |

## 8. Rollout

Single PR on `feat/57-app-has-no-dark-mode-os-preference-ignor`. No feature flag — the
change is cosmetic and reversible via a one-line `localStorage.removeItem` in the
console. After merge:

1. Verify production at `dumpit.com.br/dashboard` with OS in dark mode.
2. Close issue #48 manually (linked in PR body but separate from the `Closes #57`
   auto-close, since #48 is a dependency not the primary issue).
3. Open a follow-up issue for badge dark token overrides.

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
