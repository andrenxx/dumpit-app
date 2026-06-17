# Spec 015 — Framer Motion Animations (Phase 1)

| Field    | Value                                                                 |
| -------- | --------------------------------------------------------------------- |
| Issue    | [#15](https://github.com/andrenxx/dumpit/issues/15)                   |
| Branch   | `feat/15-framer-motion-animations-phase-1`                            |
| Status   | Draft — awaiting review                                               |
| Type     | feature                                                               |

## 1. Context

The app has no motion feedback — page switches, modal entrance/exit, card mounts, and overlay appearances are all instant. This reads as unfinished compared to modern mobile-first products. Framer Motion is the React animation standard and integrates cleanly with our existing Tailwind + inline-style stack.

Phase 2 (shadcn/ui) is separate and does not depend on this PR.

## 2. Goals

- Install `framer-motion` as a production dependency.
- Page switch between Dump and Tarefas animates with a directional slide + fade.
- `LoginModal` animates in (fade + scale up) and out (fade + scale down).
- `LoadingOverlay` fades in instead of appearing instantly.
- `TaskCard` animates on first mount (fade + slide up from 8px).
- No regression in dnd-kit drag-and-drop behaviour.

## 2.5 Validation strategy

Manual flow in `npm run dev` (port 5173):
1. Switch between Dump and Tarefas via BottomNav — pages slide in from the correct direction.
2. Open and close LoginModal — modal fades + scales in/out.
3. Submit a dump — LoadingOverlay fades in instead of snapping.
4. Navigate to Tarefas with tasks loaded — cards fade+slide up on mount.
5. Drag a card between columns — drag behaviour unchanged (no stutter, no ghost animation conflict).

No automated tests added — animations are visual and require manual verification.

## 3. Non-goals

- shadcn/ui migration (Phase 2).
- Gesture-based animations (swipe to delete, spring physics beyond defaults).
- Skeleton loading animation changes (already CSS-based).
- Animating the BottomNav or TopBar.
- Page-level route transitions (Landing → /dashboard) — out of scope for now.
- Any layout or feature changes.

## 4. Design

### 4.1 Dependency

```bash
npm install framer-motion
```

Current bundle is ~477KB JS gzip 140KB. Framer Motion adds ~50KB gzip. Acceptable for the visual gain.

### 4.2 Page transition (App.jsx)

Replace the inline conditional in `AppShell` with `AnimatePresence` + `motion.div`:

```jsx
import { AnimatePresence, motion } from 'framer-motion'

const pageVariants = {
  initial: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit:    (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}
const pageTransition = { duration: 0.22, ease: 'easeInOut' }
```

Direction: Dump → Tarefas = `dir = 1` (slide left), Tarefas → Dump = `dir = -1` (slide right). Store `dir` in `AppShell` state alongside `activePage`.

### 4.3 LoginModal (LoginModal.jsx)

Wrap the modal content in `AnimatePresence`. The backdrop and card animate separately:

```jsx
// Backdrop: opacity 0 → 1
// Card: opacity 0 + scale 0.95 → opacity 1 + scale 1
const modalVariants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.14 } },
}
```

`AnimatePresence` wraps the modal conditional (`isOpen`) so the exit animation plays before unmount.

### 4.4 LoadingOverlay (LoadingOverlay.jsx)

Replace `if (!visible) return null` with `AnimatePresence` + `motion.div`:

```jsx
<AnimatePresence>
  {visible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'absolute', inset: 0, zIndex: 50, ... }}
    >
      {/* existing spinner + text */}
    </motion.div>
  )}
</AnimatePresence>
```

### 4.5 TaskCard (TaskCard.jsx)

Add a `motion.div` wrapper around the existing `div`. The `useSortable` ref stays on the inner div to avoid conflicting with dnd-kit's transform:

```jsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
    {/* existing card content */}
  </div>
</motion.div>
```

This avoids any conflict with dnd-kit's CSS transform on the inner div.

### 4.6 dnd-kit compatibility note

Framer Motion's `layout` prop conflicts with dnd-kit transforms. We do **not** use `layout` on any draggable element. The `motion.div` on TaskCard is only for mount animation, not layout animation.

## 4.5 UX decision

N/A — no discovery opened; animation choices are standard for the product category.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `package.json` | modify | Add `framer-motion` dependency |
| `src/App.jsx` | modify | AnimatePresence + directional page transition |
| `src/components/auth/LoginModal.jsx` | modify | AnimatePresence + fade+scale modal |
| `src/components/ui/LoadingOverlay.jsx` | modify | AnimatePresence + fade overlay |
| `src/components/tasks/TaskCard.jsx` | modify | motion.div mount animation |

## 6. Acceptance

- [ ] `npm install` adds `framer-motion` to `dependencies` in `package.json`.
- [ ] Switching Dump → Tarefas slides pages left; Tarefas → Dump slides right.
- [ ] Opening LoginModal: card fades + scales in. Closing: fades + scales out.
- [ ] LoadingOverlay fades in (no snap).
- [ ] TaskCards fade + slide up on mount.
- [ ] Drag-and-drop between Kanban columns works without visual glitches.
- [ ] `lint` and `build` gates pass.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Framer Motion `layout` conflicts with dnd-kit transforms | Explicitly excluded in §4.6; only use `motion.div` for mount/unmount animation on TaskCard |
| Bundle size increase | ~50KB gzip — acceptable; documented in §4.1 |
| AnimatePresence exit animation delay perceived as lag | Keep durations ≤ 220ms; exit ≤ 140ms |

## 8. Rollout

Single PR. No feature flag needed — animations are additive and degrade gracefully if Framer Motion fails to load. Phase 2 (shadcn/ui) opens a separate issue after this ships.

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
