# Spec 024 — UI redesign v2 — TasksPage components

| Field    | Value                                                                                |
| -------- | ------------------------------------------------------------------------------------ |
| Issue    | [#24](https://github.com/andrenxx/dumpit/issues/24)                                  |
| Branch   | `feat/24-ui-redesign-v2-taskspage-components`                                        |
| Status   | Draft — awaiting review                                                               |
| Type     | feature                                                                               |

## 1. Context

Child of issue #19 (spec 019). Depends on specs #21 (tokens) and #22 (App shell), both merged. Parallelisable with spec #23 (DumpPage, now also merged). Rebuilds the TasksPage and all its sub-components with the Liquid Glass aesthetic.

Current state: `TasksPage` fetches tasks from Supabase and renders a `KanbanBoard`; `KanbanColumn` uses flat inline styles; `TaskCard` wraps a shadcn `<Card>` with Framer Motion mount animation; `NewTaskButton` is a plain `div` with JS hover handlers. The custom error-toast approach (`setErrorToast` state) is replaced by `toast.error` from `sonner`.

## 2. Goals

- `src/pages/TasksPage.jsx`: add `ProgressCard` above `KanbanBoard`; replace custom `errorToast` state + `showError()` with `toast.error()`; remove `SkeletonBoard` (loading state moved to `KanbanColumn`); pass `loading` prop to `KanbanBoard`.
- `src/components/tasks/ProgressCard.jsx` (new): purple gradient card; counts `feito` tasks vs total; `motion.span key={doneCount}` animated counter.
- `src/components/tasks/KanbanBoard.jsx`: use `toast.error()` on drag error (remove `onError` prop); add `AnimatePresence` around column contents for card enter/exit; pass `loading` down to each `KanbanColumn`.
- `src/components/tasks/KanbanColumn.jsx`: glass-surface wrapper; per-status tint header (`a_fazer → yellow/14%`, `fazendo → coral/11%`, `feito → mint/11%`); count badge `bg-white/70`; show shadcn `<Skeleton>` (3×) while loading.
- `src/components/tasks/TaskCard.jsx`: `motion.div` with `layout` (disabled during drag), `initial/animate/exit`, `whileHover={{ y: -2 }}`; `glass-surface-strong glass-inset-highlight rounded-[20px]`; shadcn `ShadcnBadge` from `shadcn-badge.jsx` with pastel classes per priority; completion `scale: [1, 1.06, 1]` via `useAnimationControls`.
- `src/components/tasks/NewTaskButton.jsx`: `motion.button` with `whileHover` and `whileTap={{ scale: 0.98 }}`; glass background; dashed border.
- `npm run lint` and `npm run build` pass.

## 2.5 Validation strategy

Run `npm run dev`, log in, submit tasks from DumpPage, navigate to Tarefas:
1. ProgressCard renders at top with purple gradient; count number pops when a card is moved to "feito".
2. KanbanColumns have yellow/coral/mint tinted headers; Skeleton cards appear while loading.
3. TaskCards are glass; dragging works; card enters/exits with animation.
4. Moving a card to "feito" triggers the completion scale pulse.
5. On Supabase error: `toast.error` toast appears top-center (from sonner); no custom toast element in the DOM.
6. NewTaskButton hover animates border to brand color.
Run `npm run build` — exits 0.

## 3. Non-goals

- Task editing dialog logic (Dialog installed in #21 but no interaction in this PR).
- Delete task.
- Payment logic.
- DumpPage changes (chunk #23).
- Auth flow changes.

## 4. Design

### 4.1 ProgressCard.jsx (new)

```jsx
import { motion } from 'framer-motion'

export function ProgressCard({ tasks }) {
  const done = tasks.filter((t) => t.status === 'feito').length
  const total = tasks.length

  return (
    <div className="rounded-[20px] px-5 py-4 mb-3 flex-shrink-0"
         style={{ background: 'linear-gradient(135deg, rgba(91,61,242,0.82), rgba(68,39,214,0.85))',
                  boxShadow: '0 8px 24px rgba(91,61,242,0.22)' }}>
      <div className="text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
        Progresso
      </div>
      <div className="flex items-baseline gap-1.5">
        <motion.span
          key={done}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[28px] font-bold text-white leading-none"
        >
          {done}
        </motion.span>
        <span className="text-[14px] text-white/60">/ {total} concluídas</span>
      </div>
    </div>
  )
}
```

### 4.2 TasksPage.jsx changes

- Import `ProgressCard`, `toast` from `sonner`.
- Remove `errorToast` state, `showError()`, and custom error `<div>`.
- Remove `SkeletonBoard` (loading now lives in `KanbanColumn`).
- Pass `loading` to `KanbanBoard`.
- Pass `onError={() => toast.error('Algo deu errado. Tente novamente.')}`.
- Render `<ProgressCard tasks={tasks} />` above `<KanbanBoard>`.
- Wrap the content in `px-5` padding div.

### 4.3 KanbanBoard.jsx changes

- Remove `onError` prop; call `toast.error(...)` directly (import `toast` from `sonner`).
- Accept and pass `loading` prop to each `KanbanColumn`.
- Wrap `<KanbanColumn>` list in `<AnimatePresence>` (for future column add/remove; currently keeps the same columns but enables exit animations on column removal).

### 4.4 KanbanColumn.jsx changes

Status tints:

```js
const STATUS_CONFIG = {
  a_fazer: { label: 'A fazer', tint: 'rgba(255,203,71,0.14)', dot: '#FFCB47' },
  fazendo: { label: 'Fazendo', tint: 'rgba(255,111,82,0.11)', dot: '#FF6F52' },
  feito:   { label: 'Feito',   tint: 'rgba(0,210,160,0.11)',  dot: '#00D2A0' },
}
```

Header: glass-surface card, tint background, count badge `bg-white/70 rounded-full`.

Drop zone: glass-inset-highlight on hover.

Loading: when `loading` prop is true, render three shadcn `<Skeleton>` placeholders (h-16, rounded-[16px]) instead of `<SortableContext>`.

### 4.5 TaskCard.jsx changes

- `motion.div` wraps directly (instead of `motion.div` → `Card`); ref attached to `motion.div` via `useSortable`.
- Apply `layout` only when not dragging: `layout={!isDragging}`.
- `initial={{ opacity: 0, y: 8 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0, scale: 0.95 }}`, `whileHover={{ y: -2 }}`.
- Classes: `glass-surface-strong glass-inset-highlight rounded-[20px] shadow-glass-sm`.
- Priority badge: `ShadcnBadge` from `../ui/shadcn-badge` with className:
  - `alta → 'bg-coral/[0.22] text-[#C24A33] border-0'`
  - `media → 'bg-yellow/[0.28] text-[#8A6418] border-0'`
  - `baixa → 'bg-mint/[0.16] text-[#1A8A6C] border-0'`
- Completion animation: `useAnimationControls`; on `task.status` change to `'feito'`, fire `controls.start({ scale: [1, 1.06, 1], transition: { duration: 0.3 } })`.
- Apply dnd transform via inline `style` (not Framer animate): `transform: CSS.Transform.toString(transform)`.

### 4.6 NewTaskButton.jsx changes

```jsx
import { motion } from 'framer-motion'

export function NewTaskButton() {
  return (
    <motion.button
      whileHover={{ borderColor: '#5B3DF2', color: '#5B3DF2' }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-1.5 glass-surface rounded-[14px] text-[12px] font-medium text-text-hint cursor-pointer flex-shrink-0"
      style={{ padding: 11, border: '1px dashed rgba(91,61,242,0.25)', background: 'rgba(255,255,255,0.45)' }}
    >
      <span className="text-brand text-[15px]">+</span> Nova task
    </motion.button>
  )
}
```

## 4.5 UX decision

N/A — discovery marked ux: not-applicable.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `src/pages/TasksPage.jsx` | modify | Add ProgressCard, toast.error, remove SkeletonBoard + errorToast |
| `src/components/tasks/ProgressCard.jsx` | create | Purple gradient card, animated counter |
| `src/components/tasks/KanbanBoard.jsx` | modify | toast.error, loading prop, AnimatePresence |
| `src/components/tasks/KanbanColumn.jsx` | modify | Glass surface, status tints, Skeleton loading |
| `src/components/tasks/TaskCard.jsx` | modify | Glass surface, ShadcnBadge, layout+exit animations, completion pulse |
| `src/components/tasks/NewTaskButton.jsx` | modify | motion.button whileHover/whileTap |

## 6. Acceptance

- [ ] ProgressCard renders above KanbanBoard with purple gradient.
- [ ] ProgressCard counter (`motion.span key={done}`) animates on change.
- [ ] KanbanColumns have yellow/coral/mint tinted headers per status.
- [ ] KanbanColumn shows three `<Skeleton>` placeholders while `loading`.
- [ ] TaskCards use `glass-surface-strong` class (glass effect visible).
- [ ] TaskCard `ShadcnBadge` shows pastel priority tints (coral/yellow/mint).
- [ ] Drag-and-drop between columns works.
- [ ] Moving card to "feito" triggers `scale: [1, 1.06, 1]` completion pulse.
- [ ] TaskCard exits with `opacity: 0, scale: 0.95` animation.
- [ ] Supabase drag error shows `toast.error` (top-center) — no custom error div in DOM.
- [ ] NewTaskButton: hover border animates to brand, `whileTap={{ scale: 0.98 }}`.
- [ ] `npm run lint` exits 0.
- [ ] `npm run build` exits 0.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| `motion.div layout` + dnd-kit transform conflict | Apply dnd `transform` via `style` prop (CSS.Transform.toString), not Framer `animate`; disable `layout` while `isDragging` |
| `AnimatePresence` exit on TaskCard requires parent to keep task in list during exit | Optimistic update removes the task from the old column immediately; exit animation needs the item to remain mounted briefly → wrap column's task list in `AnimatePresence` with each card keyed to `task.id` |
| `useAnimationControls` completion fire on every render | Guard with `useEffect` dependency on `task.status` — fire only when it transitions to `'feito'` |
| `sonner` not in scope — it was installed in spec #21 (merged) | `toast` import from `sonner` requires the package to be on `main`; this branch is rebased on main, so it is available |
| `ShadcnBadge` export name (not `Badge`) | Import as `{ ShadcnBadge }` from `'../ui/shadcn-badge'` — the spec #21 naming decision |

**Decomposition verdict:** single

All six files are tightly coupled to the TasksPage UX flow (ProgressCard reads tasks; KanbanBoard feeds KanbanColumn; KanbanColumn renders TaskCards; NewTaskButton is inside each column). Shipping any subset produces an incoherent TasksPage. Files are disjoint from DumpPage (chunk #23). Single PR is correct.

## 8. Rollout

Single commit:

1. `feat(#24): TasksPage — ProgressCard, KanbanBoard, KanbanColumn, TaskCard, NewTaskButton glass redesign`

**Pre-conditions:** `main` must carry specs #21 (tokens, `ShadcnBadge`, `sonner`) and #22 (App shell). Rebase before implementing.
