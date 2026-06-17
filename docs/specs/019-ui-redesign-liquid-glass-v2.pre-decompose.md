# Spec 019 — UI redesign — Liquid Glass v2

| Field  | Value                                                               |
| ------ | ------------------------------------------------------------------- |
| Issue  | [#19](https://github.com/andrenxx/dumpit/issues/19)                 |
| Branch | `feat/19-ui-redesign-liquid-glass-v2`                               |
| Status | Draft — awaiting review                                             |
| Type   | feature                                                             |

## 1. Context

The current UI (`v1`) uses flat Tailwind utility classes and inline styles — functional but visually plain. A complete visual redesign was designed and validated externally (`docs/wireframe_v7.html`). The new aesthetic is "Liquid Glass": translucent surfaces with `backdrop-filter: blur()`, coloured ambient blobs in the background, Framer Motion for all transitions, and an updated design token set.

The v1 shadcn/ui setup (spec #017) installed `button`, `input`, `card`. This spec extends it with `textarea`, `badge`, `skeleton`, `sonner`, and `dialog`.

Reference: `docs/wireframe_v7.html` — open in browser before implementing. The HTML/CSS is a vanilla prototype; the goal is to reproduce the visual result and behaviour in React + Tailwind + shadcn/ui + Framer Motion — not to copy the file structure.

## 2. Goals

- Replace all v1 component styles with the Liquid Glass aesthetic (glassmorphism: `backdrop-filter`, translucent borders, coloured box-shadows).
- Update design tokens in `tailwind.config.js` and `src/index.css` (new brand `#5B3DF2`, coral, mint, yellow accents; glass utility classes).
- Add `AmbientBlobs` — three fixed blurred div orbs rendered once behind all pages.
- Rebuild `TopBar` with glass surface and coral gradient avatar.
- Rebuild `BottomNav` as a floating dock with Framer Motion `layoutId` active-pill animation.
- Rebuild `DumpInput` with shadcn `Textarea` inside a glass wrapper; `ExampleCard` with Framer Motion hover/tap.
- Rebuild `LoadingOverlay` with blob-morph Tailwind keyframe and a Framer Motion progress bar.
- Add `ProgressCard` in `TasksPage` (animated counter via Framer Motion `key`).
- Rebuild `KanbanBoard`, `KanbanColumn`, `TaskCard` — dnd-kit for drag logic, Framer Motion for card enter/exit/complete animations.
- Add `NewTaskButton` with Framer Motion hover/tap.
- Replace any custom toast with `sonner` (`toast.error` / `toast.success`); render `<Toaster />` once in App.jsx.
- `lint` and `build` gates pass.

## 2.5 Validation strategy

Open `http://localhost:5173` in the preview and compare against `docs/wireframe_v7.html` opened side-by-side:

1. **App background** — three coloured blobs visible behind all content; no flash of unstyled content.
2. **TopBar** — "dump**it**" logo with brand pill; coral gradient avatar circle.
3. **BottomNav** — floating dock glass card; active pill slides smoothly between Dump and Tarefas (Framer Motion spring).
4. **DumpPage** — heading with yellow-highlight on "cabeça?"; DumpInput glass card with Textarea + gradient Dump ✦ button; ExampleCard with mint label.
5. **LoadingOverlay** — appears on submit; blob-morph icon animates; progress bar fills over ~2 s; fades in/out via AnimatePresence.
6. **TasksPage** — ProgressCard purple gradient with animated count number; three KanbanColumns with correct tint headers (yellow/coral/mint); TaskCards glass; Skeleton shown during load.
7. **Drag-and-drop** — cards draggable between columns; completion animation fires when moved to "feito".
8. **Toasts** — `toast.error` appears on API failure (top-center); no custom toast component in the codebase.
9. `npm run lint` exits 0.
10. `npm run build` exits 0.

## 3. Non-goals

- Task editing (Dialog installed but no logic — next issue).
- Delete task.
- Payment / Stripe / plan gating (FreemiumBanner renders but "Assinar" button is a stub).
- Check-in daily summary, push notifications.
- Filters in TasksPage header.
- Dark mode.
- Accessibility audit (separate issue).

## 4. Design

### 4.1 Design tokens

**`tailwind.config.js`** — add inside `theme.extend`:

```js
colors: {
  'bg-app': '#FAF9FC',
  'text-primary': '#1A1530',
  'text-secondary': '#5E5878',
  'text-hint': '#ACA4C8',
  brand: { DEFAULT: '#5B3DF2', deep: '#4427D6' },
  coral: '#FF6F52',
  mint: '#00D2A0',
  yellow: '#FFCB47',
},
backdropBlur: { xs: '8px' },
boxShadow: {
  'glass-sm':           '0 3px 12px rgba(91,61,242,0.06)',
  'glass-md':           '0 6px 18px rgba(91,61,242,0.12)',
  'glass-button':       '0 6px 16px rgba(91,61,242,0.25)',
  'glass-card-purple':  '0 8px 24px rgba(91,61,242,0.22)',
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

**`src/index.css`** — add three glass utility classes and update `body`:

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
body {
  background: #FAF9FC;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1A1530;
}
```

### 4.2 New shadcn components

```bash
npx shadcn@latest add textarea badge skeleton sonner dialog --yes
```

(`button`, `input`, `card` are already installed from spec #017.)

### 4.3 App.jsx shell

- Render `<AmbientBlobs />` as the first child (fixed, `-z-10`).
- Render `<Toaster position="top-center" />` from `sonner`.
- Wrap page content in `<AnimatePresence mode="wait">` with `motion.div` for each page (opacity + x slide, `duration: 0.25`).
- `LoadingOverlay` placed inside the shell (absolute, covers page area).
- Remove router (`createBrowserRouter` / `RouterProvider`) from App.jsx — the app is now single-page with `activePage` state for Dump / Tarefas. `AuthGuard` and `Landing` stay on the React Router routes.

### 4.4 Layout components

**`AmbientBlobs.jsx`** — Three `div` elements: `position: fixed`, `border-radius: 50%`, `filter: blur(60px)`, `pointer-events-none`, `z-index: -10`. Purple top-right (260×260, opacity 0.22), coral bottom-left (220×220, opacity 0.16), mint mid-right (180×180, opacity 0.14). No animation — static blobs.

**`TopBar.jsx`** — `glass-surface` container, `sticky top-0 z-20`, `border-b`. Logo: `dump` + branded `it` pill (`bg-brand/[0.07] border border-brand/[0.12] backdrop-blur-xs rounded-[9px]`). Avatar: 32px circle, `linear-gradient(145deg, #FF6F52, #FFA988)`, shadow `0 3px 10px rgba(255,111,82,0.22)`, user initial.

**`BottomNav.jsx`** — Floating glass dock (`glass-surface-strong glass-inset-highlight`, `rounded-[26px]`, shadow `0 8px 28px rgba(91,61,242,0.14)`). Two items (Dump ✦, Tarefas ☰). Active state: `motion.div layoutId="nav-active-pill"` with brand gradient (`from-brand to-brand-deep`) and spring transition (`stiffness: 400, damping: 30`). Inactive: `text-text-hint`.

### 4.5 DumpPage components

**`DumpInput.jsx`** — `motion.div` wrapper with `glass-surface-strong glass-inset-highlight rounded-[26px] shadow-glass-md`; `whileFocus={{ y: -2 }}` and shadow animate on focus. Inside: shadcn `<Textarea>` with `border-none shadow-none focus-visible:ring-0 resize-none`. Footer: character count + shadcn `<Button>` with `bg-gradient-to-br from-brand to-brand-deep rounded-[18px] shadow-glass-button`.

**`ExampleCard.jsx`** — `motion.div` with `whileHover={{ y: -1 }}` and `whileTap={{ scale: 0.98 }}`; mint-tinted glass card; mint label badge on click fills DumpInput and fires `handleSubmit`.

**`FreemiumBanner.jsx`** — `AnimatePresence` with `motion.div` animating `height: 0 → 'auto'` and `opacity`. coral/08 background; "Assinar plano pago" button is visual-only (no payment logic this issue).

**`LoadingOverlay.jsx`** — `AnimatePresence` fade. Blob-morph icon: 84px `motion.div` with brand-to-coral gradient and `animate-blob-morph` class (Tailwind keyframe). Framer Motion progress bar: `initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2 }}`.

### 4.6 TasksPage components

**`ProgressCard.jsx`** — Purple gradient card (`from-brand/[0.82] to-brand-deep/[0.85]`). Counts tasks with `status === 'feito'` vs total. Animated counter: wrap number in `motion.span` with `key={doneCount}` + `initial={{ opacity: 0, y: 4 }}` so it pops on change.

**`KanbanBoard.jsx`** — dnd-kit for drag logic (`DndContext`, `SortableContext`, `PointerSensor` with `activationConstraint: { distance: 8 }`). On drag end: update local state optimistically → PATCH Supabase `status` + `position`. Error → revert + `toast.error`. Framer Motion `AnimatePresence` wraps column contents for card enter/exit.

**`KanbanColumn.jsx`** — Glass surface wrapper. Header with per-status tint: `a_fazer → bg-yellow/[0.14]`, `fazendo → bg-coral/[0.11]`, `feito → bg-mint/[0.11]`. Count badge: `bg-white/70 rounded-full`. Shows shadcn `<Skeleton>` (3×) while loading.

**`TaskCard.jsx`** — `motion.div` with `layout`, `initial/animate/exit` (opacity, y, scale), `whileHover={{ y: -2 }}`. `glass-surface-strong glass-inset-highlight rounded-[20px] shadow-glass-sm hover:shadow-glass-md`. Uses `useSortable` from dnd-kit (ref on the `motion.div` itself — no layout prop conflict since we're not using the dnd transform via Framer). Badge: shadcn `<Badge>` with pastel className per priority (`alta → bg-coral/[0.22] text-[#C24A33]`, `media → bg-yellow/[0.28] text-[#8A6418]`, `baixa → bg-mint/[0.16] text-[#1A8A6C]`). Completion: on status change to `feito`, trigger `scale: [1, 1.06, 1]` via `useAnimationControls`.

**`NewTaskButton.jsx`** — `motion.button` with `whileHover` border-color to brand and `whileTap={{ scale: 0.98 }}`; dashed border, glass background.

### 4.7 Toasts

`sonner` — use `toast.error()` / `toast.success()` everywhere. Remove any existing custom toast component. `<Toaster />` in App.jsx only.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `docs/wireframe_v7.html` | committed | Reference wireframe — already committed in this spec's first commit; no further edits needed |
| `tailwind.config.js` | modify | New tokens: colors, backdropBlur, boxShadow, keyframes, animation |
| `src/index.css` | modify | Glass utility classes + updated body |
| `package.json` | modify | Add `sonner` dep (shadcn adds via CLI) |
| `src/App.jsx` | modify | AmbientBlobs, Toaster, AnimatePresence page transitions, remove router boilerplate |
| `src/components/layout/AmbientBlobs.jsx` | create | Three fixed ambient blobs |
| `src/components/layout/TopBar.jsx` | modify | Glass surface, branded logo pill, coral avatar |
| `src/components/layout/BottomNav.jsx` | modify | Floating dock, Framer Motion layoutId pill |
| `src/components/dump/DumpInput.jsx` | modify | glass wrapper, shadcn Textarea, gradient Button |
| `src/components/dump/ExampleCard.jsx` | modify | Framer Motion whileHover/whileTap, mint label |
| `src/components/ui/LoadingOverlay.jsx` | modify | blob-morph icon, Framer Motion progress bar |
| `src/components/ui/FreemiumBanner.jsx` | modify | AnimatePresence height slide-open |
| `src/pages/TasksPage.jsx` | modify | Add ProgressCard, KanbanBoard, restructure layout |
| `src/components/tasks/ProgressCard.jsx` | create | Purple gradient card, animated counter |
| `src/components/tasks/KanbanBoard.jsx` | modify | dnd-kit + AnimatePresence for card enter/exit |
| `src/components/tasks/KanbanColumn.jsx` | create | Column header tints, Skeleton loading state |
| `src/components/tasks/TaskCard.jsx` | modify | Framer Motion layout+exit, shadcn Badge variants, completion animation |
| `src/components/tasks/NewTaskButton.jsx` | create | Framer Motion hover/tap |

> `src/components/ui/Badge.jsx` (DumpIt wrapper, capital B) — **not modified**; `badge.jsx` (shadcn, lowercase) is added by the CLI and used directly in `TaskCard.jsx`.

## 6. Acceptance

- [ ] `docs/wireframe_v7.html` committed to repo.
- [ ] Three ambient blobs visible behind all content, `z-index: -10`.
- [ ] TopBar: glass surface; "dump**it**" logo with brand pill; coral avatar renders user initial.
- [ ] BottomNav: floating dock; active pill slides via Framer Motion `layoutId` spring.
- [ ] DumpInput: glass wrapper lifts on focus; shadcn Textarea with no border/shadow; gradient Dump ✦ button.
- [ ] ExampleCard: mint label; `whileHover`/`whileTap` fire visibly.
- [ ] LoadingOverlay: blob-morph icon animates; progress bar fills ~2 s; AnimatePresence fade-in/out.
- [ ] FreemiumBanner: animates height open/closed via AnimatePresence.
- [ ] ProgressCard: purple gradient; count number pops on change.
- [ ] KanbanColumns: correct tint per status; Skeleton shown while loading.
- [ ] TaskCards: glass surface; shadcn Badge with pastel tints; drag-and-drop works; completion scale animation fires.
- [ ] NewTaskButton: hover border animates to brand.
- [ ] No custom toast component — only `toast.error`/`toast.success` from sonner.
- [ ] `npm run lint` exits 0.
- [ ] `npm run build` exits 0.

> **Note:** this project has no automated unit/integration test gate yet (CLAUDE.md §Sanity gates). Visual correctness is validated via the §2.5 manual oracle (localhost vs wireframe).

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| `motion.div layout` + dnd-kit transform conflict | Use `useSortable` ref on `motion.div` directly; do not use the dnd-kit CSS transform via Framer — apply dnd transform via `style` prop only, not Framer's `animate`. The `layout` prop is dropped on `motion.div` while `isDragging` is true to avoid Framer fighting dnd position updates. |
| `backdrop-filter` not supported in old Chromium/WebKit | Progressive enhancement: glassmorphism degrades to white/translucent without blur; no functional loss |
| `sonner` peer-dep conflict with `eslint@10` | Install with `--legacy-peer-deps` (same pattern as framer-motion) |
| shadcn `badge.jsx` vs `Badge.jsx` case collision on macOS | See spec #017 — shadcn CLI is run in CI (Linux, case-sensitive FS); on macOS the file is written manually if needed |
| Large diff — high reviewer fatigue | Components are visually coupled (can't ship half a redesign); plan incremental commits per section (tokens → layout → dump → tasks) |

## 8. Rollout

Single PR, four incremental commits:

1. `chore(#19): design tokens, glass CSS utilities, shadcn extras (textarea/badge/skeleton/sonner/dialog)` — no visual change yet.
2. `feat(#19): App shell — AmbientBlobs, TopBar, BottomNav, page transitions` — visible immediately on `/dashboard`.
3. `feat(#19): DumpPage — DumpInput, ExampleCard, FreemiumBanner, LoadingOverlay` — DumpPage complete.
4. `feat(#19): TasksPage — ProgressCard, KanbanBoard, KanbanColumn, TaskCard, NewTaskButton` — TasksPage complete.

After merge: open a follow-up issue for task editing (Dialog logic) separately.
