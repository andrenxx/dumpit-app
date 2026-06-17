# Spec 019 — UI redesign — Liquid Glass v2

| Field  | Value                                                               |
| ------ | ------------------------------------------------------------------- |
| Issue  | [#19](https://github.com/andrenxx/dumpit/issues/19)                 |
| Branch | `feat/19-ui-redesign-liquid-glass-v2`                               |
| Status | Draft — awaiting review                                             |
| Type   | feature                                                             |

## 1. Context

This spec was decomposed by `/decompose` because the original scope was too large for a single PR. The original body has been preserved at this file with the suffix `.pre-decompose.md` for recovery; the canonical record going forward is the table of children below.

## 2. Children

Each child has an issue and a branch on origin. PRs are opened when a contributor runs `/spec <child-number>` on the child branch.

| # | Title | Branch |
| - | ----- | ------ |
| #21 | UI redesign v2 — design tokens, glass CSS, shadcn extras | `chore/21-ui-redesign-v2-design-tokens-glass-css-shadcn-extras` |
| #22 | UI redesign v2 — App shell, AmbientBlobs, TopBar, BottomNav | `feat/22-ui-redesign-v2-app-shell-ambientblobs-topbar-bottomnav` |
| #23 | UI redesign v2 — DumpPage components | `feat/23-ui-redesign-v2-dumppage-components` |
| #24 | UI redesign v2 — TasksPage components | `feat/24-ui-redesign-v2-taskspage-components` |

### Summaries

- **#21 UI redesign v2 — design tokens, glass CSS, shadcn extras.** Install new design tokens (brand #5B3DF2, coral, mint, yellow, glass box-shadows, blob-morph keyframe), glass CSS utility classes, and additional shadcn primitives (textarea, badge, skeleton, sonner, dialog).
- **#22 UI redesign v2 — App shell, AmbientBlobs, TopBar, BottomNav.** Rebuild App.jsx shell with AmbientBlobs, Toaster, AnimatePresence page transitions. New AmbientBlobs.jsx. Rebuild TopBar with glass surface and coral avatar. Rebuild BottomNav as floating dock with Framer Motion layoutId pill.
- **#23 UI redesign v2 — DumpPage components.** Rebuild DumpInput with glass wrapper + shadcn Textarea, ExampleCard with Framer Motion hover/tap, FreemiumBanner with AnimatePresence height slide, LoadingOverlay with blob-morph icon and progress bar.
- **#24 UI redesign v2 — TasksPage components.** Add ProgressCard (purple gradient, animated counter), rebuild KanbanBoard (dnd-kit + AnimatePresence), new KanbanColumn (status tints, Skeleton), rebuild TaskCard (glass, shadcn Badge, completion animation), new NewTaskButton.
## 2.5 Validation strategy (inherited from pre-decompose)

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

## 3. Acceptance (parent-level)

- [ ] Each child has been picked up via `/spec <child>` and progressed through the standard flow.
- [ ] All children listed above are merged.
- [ ] Decomposition record (this spec) ships as a small docs PR through the normal flow.

## 4. Risks and Rollout

Decomposition itself is a low-risk operation; the substantive risks live in each child spec. Rollout: each child proceeds independently through the standard /spec → /implement → /code-review → /ship loop. Sibling order is the human's call (no automated blocking).
