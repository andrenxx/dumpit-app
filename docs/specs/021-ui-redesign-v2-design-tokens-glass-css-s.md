# Spec 021 — UI redesign v2 — design tokens, glass CSS, shadcn extras

| Field    | Value                                                                                |
| -------- | ------------------------------------------------------------------------------------ |
| Issue    | [#21](https://github.com/andrenxx/dumpit/issues/21)                                  |
| Branch   | `chore/21-ui-redesign-v2-design-tokens-glass-css-shadcn-extras`                      |
| Status   | Draft — awaiting review                                                               |
| Type     | chore                                                                                 |

## 1. Context

Child of issue #19 (UI redesign — Liquid Glass v2, decomposed in spec 019). The current design token set in `tailwind.config.js` and `src/index.css` reflects the v1 visual style (brand `#2B1C9A`, flat surfaces, no glassmorphism). This chunk installs the shared foundation that every visual chunk (#22, #23, #24) will depend on: new Tailwind tokens, CSS glass-surface utility classes, and additional shadcn/ui primitives. No component changes in this chunk — only the styling layer.

Installed in spec 017: `button`, `input`, `card`. This spec adds the remaining primitives needed for the redesign.

## 2. Goals

- Extend `tailwind.config.js` with new color tokens, backdropBlur, boxShadow variants, blob-morph keyframe and animation.
- Add `.glass-surface`, `.glass-surface-strong`, `.glass-inset-highlight` to `src/index.css`.
- Update `body` in `src/index.css` to use new `#FAF9FC` background and `#1A1530` text.
- Install shadcn primitives: `textarea`, `badge` (shadcn lowercase), `skeleton`, `sonner`, `dialog`.
- `npm run lint` and `npm run build` pass.

## 2.5 Validation strategy

After implementing: run `npm run build` — the build must reference the new Tailwind classes without errors. Open `http://localhost:5173` — the page background should be `#FAF9FC` (near-white with a cool hue). Open browser DevTools and inspect the CSS output: confirm `.glass-surface`, `.glass-surface-strong`, `.glass-inset-highlight` rules are present. Confirm new shadcn files exist on disk.

## 3. Non-goals

- Any component-level changes (TopBar, BottomNav, DumpInput, TaskCard, etc.).
- Removing or updating existing shadcn components (button, input, card from spec #017).
- Visual regression testing (automated — none in this project).
- Dark mode tokens.

## 4. Design

### 4.1 tailwind.config.js additions

Add inside `theme.extend`:

```js
colors: {
  'bg-app':         '#FAF9FC',
  'text-primary':   '#1A1530',
  'text-secondary': '#5E5878',
  'text-hint':      '#ACA4C8',
  brand: { DEFAULT: '#5B3DF2', deep: '#4427D6' },
  coral:  '#FF6F52',
  mint:   '#00D2A0',
  yellow: '#FFCB47',
},
backdropBlur: { xs: '8px' },
boxShadow: {
  'glass-sm':          '0 3px 12px rgba(91,61,242,0.06)',
  'glass-md':          '0 6px 18px rgba(91,61,242,0.12)',
  'glass-button':      '0 6px 16px rgba(91,61,242,0.25)',
  'glass-card-purple': '0 8px 24px rgba(91,61,242,0.22)',
},
keyframes: {
  'blob-morph': {
    '0%, 100%': { borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%', transform: 'rotate(0deg) scale(1)' },
    '33%':      { borderRadius: '60% 40% 35% 65% / 60% 35% 65% 40%', transform: 'rotate(10deg) scale(1.06)' },
    '66%':      { borderRadius: '45% 55% 70% 30% / 35% 60% 40% 65%', transform: 'rotate(-8deg) scale(0.96)' },
  },
},
animation: { 'blob-morph': 'blob-morph 2s ease-in-out infinite' },
```

Keep all existing shadcn CSS-variable color entries (`border`, `input`, `primary`, etc.) unchanged.

### 4.2 src/index.css changes

Append the three glass utility classes and update the `body` rule:

```css
.glass-surface {
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid rgba(255,255,255,0.8);
}
.glass-surface-strong {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(24px) saturate(1.6);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  border: 1px solid rgba(255,255,255,0.8);
}
.glass-inset-highlight {
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
}
```

Update the existing `body` rule:

```css
body {
  background: #FAF9FC;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1A1530;
}
```

### 4.3 shadcn primitives

Install via:

```bash
npx shadcn@latest add textarea badge skeleton sonner dialog --yes
```

If the CLI is non-interactive (CI/macOS), install manually:
- `src/components/ui/textarea.jsx` — shadcn Textarea
- `src/components/ui/badge.jsx` (shadcn lowercase — safe to create since macOS case-insensitive FS only blocks if `Badge.jsx` already exists in the same directory, which it does not under `ui/`) — **Wait**: `Badge.jsx` (capital B, DumpIt wrapper) lives at `src/components/ui/Badge.jsx`. On macOS, `badge.jsx` and `Badge.jsx` resolve to the same inode. **Resolution**: write the shadcn badge as `src/components/ui/shadcn-badge.jsx` and re-export it as `Badge` alongside the cva variants. Then `TaskCard.jsx` (chunk #24) imports from `shadcn-badge.jsx`.
- `src/components/ui/skeleton.jsx` — shadcn Skeleton
- `src/components/ui/dialog.jsx` — shadcn Dialog
- `sonner` package + `src/components/ui/sonner.jsx` (the `<Toaster>` wrapper)

### 4.4 Package

`sonner` is installed as a dependency by the shadcn CLI. If manually installing:

```bash
npm install sonner --legacy-peer-deps
```

## 4.5 UX decision

N/A — discovery marked ux: not-applicable.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `tailwind.config.js` | modify | Add §4.1 tokens |
| `src/index.css` | modify | Add §4.2 glass utilities + update body |
| `package.json` | modify | `sonner` dep added |
| `package-lock.json` | modify | Updated by npm install |
| `src/components/ui/textarea.jsx` | create | shadcn Textarea |
| `src/components/ui/shadcn-badge.jsx` | create | shadcn Badge (cva) — renamed to avoid macOS collision with `Badge.jsx` |
| `src/components/ui/skeleton.jsx` | create | shadcn Skeleton |
| `src/components/ui/dialog.jsx` | create | shadcn Dialog |
| `src/components/ui/sonner.jsx` | create | Toaster wrapper from shadcn |

> `src/components/ui/Badge.jsx` (DumpIt wrapper, capital B) — **not modified**.

## 6. Acceptance

- [ ] `tailwind.config.js` contains `brand`, `coral`, `mint`, `yellow`, `glass-sm`, `glass-md`, `glass-button`, `glass-card-purple`, `blob-morph` keyframe and animation.
- [ ] `src/index.css` contains `.glass-surface`, `.glass-surface-strong`, `.glass-inset-highlight` rules.
- [ ] `body` background is `#FAF9FC` and color is `#1A1530`.
- [ ] `src/components/ui/textarea.jsx` exists.
- [ ] `src/components/ui/shadcn-badge.jsx` exists (shadcn cva-based badge).
- [ ] `src/components/ui/skeleton.jsx` exists.
- [ ] `src/components/ui/dialog.jsx` exists.
- [ ] `src/components/ui/sonner.jsx` exists.
- [ ] `sonner` appears in `package.json` dependencies.
- [ ] `src/components/ui/Badge.jsx` (DumpIt wrapper) is unchanged.
- [ ] `npm run lint` exits 0.
- [ ] `npm run build` exits 0.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| `badge.jsx` vs `Badge.jsx` case collision on macOS | Write shadcn badge as `shadcn-badge.jsx` — avoids the inode collision entirely |
| `sonner` peer-dep conflict with eslint@10 | Install with `--legacy-peer-deps` |
| Existing CSS variable colors in `src/index.css` overridden by new `body` rule | Only the `body` rule is updated; `:root` CSS variables are preserved |

## 8. Rollout

Single commit on this branch:

1. `chore(#21): design tokens, glass CSS utilities, shadcn extras (textarea/shadcn-badge/skeleton/sonner/dialog)`

No flag needed — this chunk adds new tokens and files without touching any component that is live today. After merge, chunks #22, #23, #24 rebase on this.
