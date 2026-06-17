# Spec 022 — UI redesign v2 — App shell, AmbientBlobs, TopBar, BottomNav

| Field    | Value                                                                                |
| -------- | ------------------------------------------------------------------------------------ |
| Issue    | [#22](https://github.com/andrenxx/dumpit/issues/22)                                  |
| Branch   | `feat/22-ui-redesign-v2-app-shell-ambientblobs-topbar-bottomnav`                     |
| Status   | Draft — awaiting review                                                               |
| Type     | feature                                                                               |

## 1. Context

Child of issue #19 (spec 019). Depends on spec #21 (design tokens + glass CSS, now merged). Rebuilds the app shell and three layout components with the Liquid Glass aesthetic. After this chunk, every page has the ambient blob background, the glass TopBar with the branded logo pill and coral avatar, and the floating BottomNav dock with Framer Motion active-pill animation.

Current state: `App.jsx` already uses `AnimatePresence`/`motion` for page transitions and `activePage` state; `TopBar` and `BottomNav` use flat inline styles.

## 2. Goals

- `src/App.jsx`: add `<AmbientBlobs />` as first child, add `<Toaster position="top-center" />` from sonner, update shell container background to transparent (body CSS handles the background).
- `src/components/layout/AmbientBlobs.jsx` (new): three `position: fixed` blurred div orbs at `z-index: -10`, pointer-events-none.
- `src/components/layout/TopBar.jsx`: glass-surface sticky header; "dump**it**" logo with branded `it` pill; coral-gradient avatar circle showing user initial.
- `src/components/layout/BottomNav.jsx`: floating glass dock card; `motion.div layoutId="nav-active-pill"` brand gradient pill with spring transition.
- `npm run lint` and `npm run build` pass.

## 2.5 Validation strategy

Run `npm run dev` and open `http://localhost:5173/dashboard` (after auth). Verify: three coloured orbs visible behind content, TopBar shows "dump**it**" with branded pill around "it", coral avatar circle renders user email initial, BottomNav is a floating rounded card (not a full-width bar), active pill slides on page switch. Run `npm run build` — exits 0.

## 3. Non-goals

- DumpPage component changes (chunk #23).
- TasksPage component changes (chunk #24).
- LoadingOverlay redesign (chunk #23 scope) — `<LoadingOverlay />` is already wired in `App.jsx`; its visual redesign is chunk #23's responsibility; this chunk leaves its import and usage untouched.
- `AnimatePresence` page transitions — already implemented in `App.jsx` (`motion.div` with `pageVariants`); this chunk does not modify that logic.
- Auth flow changes.

## 4. Design

### 4.1 AmbientBlobs.jsx (new)

Three static fixed divs, no animation:

```jsx
export function AmbientBlobs() {
  return (
    <div aria-hidden="true" style={{ pointerEvents: 'none' }}>
      <div style={{ position:'fixed', top:-60, right:-40, width:260, height:260, borderRadius:'50%',
        background:'#5B3DF2', filter:'blur(60px)', opacity:0.22, zIndex:-10 }} />
      <div style={{ position:'fixed', bottom:-30, left:-50, width:220, height:220, borderRadius:'50%',
        background:'#FF6F52', filter:'blur(60px)', opacity:0.16, zIndex:-10 }} />
      <div style={{ position:'fixed', top:'45%', right:-30, width:180, height:180, borderRadius:'50%',
        background:'#00D2A0', filter:'blur(60px)', opacity:0.14, zIndex:-10 }} />
    </div>
  )
}
```

### 4.2 App.jsx changes

- Import `AmbientBlobs` from `./components/layout/AmbientBlobs`.
- Import `Toaster` from `./components/ui/sonner`.
- Render `<AmbientBlobs />` and `<Toaster position="top-center" />` as the first two children inside `AppShell` (before `<TopBar />`).
- Change shell container `background` from `'var(--bg-app)'` to `'transparent'`.

### 4.3 TopBar.jsx

Replace inline-style implementation with Tailwind + glass utility:

```jsx
import { useAuth } from '../../hooks/useAuth'

function getInitial(email) {
  return email ? email[0].toUpperCase() : ''
}

export function TopBar() {
  const { user } = useAuth()
  return (
    <div className="glass-surface sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b border-white/40 flex-shrink-0">
      <div className="flex items-center gap-1.5 text-[17px] font-medium tracking-tight text-text-primary">
        dump
        <span className="px-[7px] py-[2px] rounded-[9px] bg-brand/[0.07] border border-brand/[0.12] backdrop-blur-xs text-brand text-[15px]">
          it
        </span>
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'linear-gradient(145deg, #FF6F52, #FFA988)',
        boxShadow: '0 3px 10px rgba(255,111,82,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 600, color: '#fff',
      }}>
        {getInitial(user?.email)}
      </div>
    </div>
  )
}
```

### 4.4 BottomNav.jsx

Replace flat bar with floating glass dock using Framer Motion `layoutId`:

```jsx
import { motion } from 'framer-motion'

const items = [
  { id: 'dump',    icon: '✦', label: 'Dump' },
  { id: 'tarefas', icon: '☰', label: 'Tarefas' },
]

export function BottomNav({ activePage, onChange }) {
  return (
    <div className="flex justify-center pb-5 pt-2 flex-shrink-0">
      <div className="glass-surface-strong glass-inset-highlight flex rounded-[26px] p-1.5 gap-1"
           style={{ boxShadow: '0 8px 28px rgba(91,61,242,0.14)' }}>
        {items.map((item) => {
          const active = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="relative flex flex-col items-center justify-center gap-1 px-8 py-2.5 rounded-[20px] text-xs font-medium transition-colors"
              style={{ color: active ? '#fff' : '#ACA4C8', minWidth: 90, border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              {active && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-[20px]"
                  style={{ background: 'linear-gradient(135deg, #5B3DF2, #4427D6)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-[18px] leading-none">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

## 4.5 UX decision

N/A — discovery marked ux: not-applicable.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/App.jsx` | modify | Add AmbientBlobs, Toaster, transparent shell bg |
| `src/components/layout/AmbientBlobs.jsx` | create | Three static fixed blobs |
| `src/components/layout/TopBar.jsx` | modify | Glass-surface, branded pill, coral avatar |
| `src/components/layout/BottomNav.jsx` | modify | Floating dock, Framer Motion layoutId pill |

## 6. Acceptance

- [ ] Three coloured blobs visible behind all content on the dashboard.
- [ ] TopBar uses `glass-surface` class; "dump**it**" shows a brand-coloured pill around "it".
- [ ] TopBar avatar is a coral-gradient circle showing user email initial.
- [ ] BottomNav is a floating rounded glass card (not a full-width bar).
- [ ] Active nav pill animates via Framer Motion spring when switching pages.
- [ ] `<Toaster position="top-center" />` rendered once in the shell.
- [ ] `npm run lint` exits 0.
- [ ] `npm run build` exits 0.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Tailwind `backdrop-blur-xs` undefined | Token added in spec #21 (merged); rebase branch on main before implementing |
| `glass-surface` / `glass-surface-strong` not purged by Tailwind | Classes are raw CSS utilities in `index.css`; always bundled regardless of purge |
| `motion.div layoutId` spring fires on initial render | `initial={false}` not needed here — the pill appearing is the desired animation |
| `src/components/ui/sonner.jsx` not found at import time | File created in spec #21 (merged); this branch must be rebased on main before implementing |
| AmbientBlobs `z-index: -10` hidden behind `body` background | `body` background is `#FAF9FC` (opaque); blobs will only show behind transparent/translucent surfaces. The blob `filter: blur(60px)` extends visually; on the app shell `background: transparent`, blobs are visible through the glass layers |
| `useAuth()` hook returning undefined `user` before session loads | `getInitial(user?.email)` already guards with optional chaining — returns empty string; avatar renders as blank circle on initial load (acceptable) |

## 8. Rollout

Single commit:

1. `feat(#22): App shell — AmbientBlobs, TopBar, BottomNav glass redesign`

Chunks #23 and #24 are parallelisable after this merges.

**Pre-condition:** `main` must carry spec #21 (design tokens + `sonner.jsx`). Rebase before implementing.

**Decomposition verdict:** single

This chunk is already the smallest independently-shippable unit: `AmbientBlobs` + `TopBar` + `BottomNav` + the `App.jsx` wiring are visually coupled (half-done would show broken layout with blobs but no glass nav). Splitting further (e.g., blobs-only vs. nav-only) fails the Ship isolation test — each fragment leaves the UI in an incoherent state. Single PR is correct.
