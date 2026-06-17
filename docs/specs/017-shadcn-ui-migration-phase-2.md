# Spec 017 — shadcn/ui migration — phase 2

| Field  | Value                                                               |
| ------ | ------------------------------------------------------------------- |
| Issue  | [#17](https://github.com/andrenxx/dumpit/issues/17)                 |
| Branch | `feat/17-shadcn-ui-migration-phase-2`                               |
| Status | Draft — awaiting review                                             |
| Type   | feature                                                             |

## 1. Context

Phase 1 (#15) added Framer Motion animations. The existing UI primitives (Button, Input, Card, Badge) use inline styles or raw Tailwind utility classes with no shared component contract — each site of use reimplements colour, spacing, and hover state independently.

shadcn/ui copies components into the project (`src/components/ui/`) using Radix UI accessibility primitives under the hood. No black-box library is added to the bundle; we get accessible, themeable primitives while keeping full code ownership. The components are driven by CSS custom properties (via `tailwind-merge` + `class-variance-authority`), making it straightforward to map DumpIt's existing design tokens to shadcn's variable slots.

This spec covers only setup + migration of the four primitives already in use. Phase 3 (future) may add new shadcn components.

## 2. Goals

- Set up shadcn/ui (`components.json`, updated Tailwind config, CSS variables in `index.css`).
- Map DumpIt brand tokens to shadcn CSS variable slots so theming is consistent.
- Migrate Button, Input, Card, and Badge to use shadcn primitives.
- Update the four call-sites that render these primitives: `LoginModal`, `DumpInput`, `TaskCard`, and `Badge` (the wrapper component).
- Keep visual appearance identical to the current design (or improve it where theming aligns naturally).
- `lint` and `build` gates pass.

## 2.5 Validation strategy

Manual visual diff in the dev server preview against the current design:

1. **Landing page** — "Entrar" button renders with `--brand` background, white text.
2. **LoginModal — email step** — email input has correct border, focus ring in `--brand`.
3. **LoginModal — code step** — 6-digit OTP input is centred, large, monospace; "Verificar" button brand-coloured; "Reenviar código" link-style.
4. **DumpPage** — `DumpInput` textarea + "Dump ✦" button preserved exactly; character counter still visible.
5. **TasksPage** — task cards render with correct card background, border, and badge variants (urgente/normal/depois) in their existing colours.
6. `npm run lint` exits 0, `npm run build` exits 0.

## 3. Non-goals

- Changing any product behaviour or layout.
- Migrating pages (`DumpPage`, `TasksPage`, `Landing`) — only shared UI primitives.
- Adding new shadcn components beyond Button, Input, Card, Badge.
- Removing Framer Motion — Phase 1 stays.
- Introducing TypeScript (spec 017 is plain JS/JSX, same as the rest of the project).
- Dark mode support (not in V1 scope).

## 4. Design

### 4.1 shadcn/ui init

Run `npx shadcn@latest init` interactively to produce `components.json`. Required answers:

| Prompt | Answer |
| ------ | ------ |
| Style | Default |
| Base colour | Neutral |
| CSS variables? | Yes |
| components path | `src/components/ui` |
| utils path | `src/lib/utils` |

This generates:
- `components.json` — shadcn configuration file.
- Updates `tailwind.config.js` — adds content path for `src/components/ui/**`, extends colours with CSS variable references (`hsl(var(--primary))` etc.).
- Appends CSS variable blocks to `src/index.css` under `:root` and `.dark`.

### 4.2 Token mapping

DumpIt's design tokens live in `src/index.css` `:root`. shadcn uses a parallel set of CSS variables in HSL format. We will **add** the shadcn variables to `:root` mapped to DumpIt values — the existing DumpIt tokens (`--brand`, `--bg-app`, etc.) are preserved unchanged.

| DumpIt token | Value | shadcn variable | HSL equivalent |
| ------------ | ----- | --------------- | -------------- |
| `--brand` | `#2B1C9A` | `--primary` | `247 69% 35%` |
| (white on primary) | `#FFFFFF` | `--primary-foreground` | `0 0% 100%` |
| `--bg-app` | `#FAF8F4` | `--background` | `38 33% 97%` |
| `--bg-card` | `#FFFFFF` | `--card` | `0 0% 100%` |
| `--text-primary` | `#1C1714` | `--foreground` | `20 17% 10%` |
| `--text-secondary` | `#8A7A6E` | `--muted-foreground` | `25 12% 49%` |
| `--border-default` | `rgba(60,40,20,.09)` | `--border` | `30 20% 50% / 0.09` |
| `--border-strong` | `rgba(60,40,20,.15)` | `--input` | `30 20% 50% / 0.15` |
| `--brand-light` | `rgba(43,28,154,.07)` | `--accent` | `247 69% 35% / 0.07` |
| (accent text) | `--brand` | `--accent-foreground` | same as `--primary` |
| `--text-hint` | `#C8BAB0` | `--muted` | `25 14% 75%` |

shadcn also needs `--radius` (border radius): set to `0.625rem` (≈ 10px, matching existing cards).

### 4.3 Components to add

Run `npx shadcn@latest add` for each:

```
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add badge
```

Each command copies a JSX file into `src/components/ui/`. The shadcn `badge.jsx` (lowercase) coexists with the DumpIt `Badge.jsx` wrapper — see §4.4 for the distinction.

### 4.4 Call-site migrations

**`src/components/ui/Badge.jsx`** — **not modified.** The DumpIt badge wrapper keeps its existing inline-style implementation (three variants: `urgente`, `normal`, `depois` with custom colours not mapped to the global token set). The shadcn `badge.jsx` (lowercase) added in §4.3 coexists without conflict — JS module resolution is case-sensitive on Linux and the import paths are distinct. `Badge.jsx` is intentionally excluded from §5 (Files).

**`src/components/dump/DumpInput.jsx`** — replace the `<button>` element with the shadcn `<Button>` component from `src/components/ui/button.jsx`. The outer card wrapper and textarea remain as-is (they are unique to this component and are not generic primitives). Button receives: no variant override needed if we configure `--primary` correctly; use `size="sm"` or custom padding via className override.

**`src/components/auth/LoginModal.jsx`** — replace `<input type="email">` and `<input type="text">` with shadcn `<Input>`; replace both `<button>` submit elements with shadcn `<Button>`; the "Reenviar código" secondary action uses `variant="ghost"`.

**`src/components/tasks/TaskCard.jsx`** — wrap card content with shadcn `<Card>` and `<CardContent>` from `src/components/ui/card.jsx` instead of the raw `<div style={style}>`. The `useSortable` ref (`setNodeRef`) and DnD props move to the outer `<Card>` element. Keep the existing inline `style` for transform/transition/opacity (dnd-kit requires those). The Framer Motion outer wrapper (from feat/15 branch) does not exist on this branch — `feat/17` was cut from main.

### 4.5 UX decision

N/A — this is a purely structural migration with no user-visible UX change.

## 5. Files

| Path | Action | Notes |
| ---- | ------ | ----- |
| `components.json` | create | shadcn config |
| `tailwind.config.js` | modify | add CSS var colour references, content path for `src/components/ui` |
| `src/index.css` | modify | append shadcn CSS variable block under `:root` |
| `src/lib/utils.js` | create | shadcn `cn()` helper (`clsx` + `tailwind-merge`) |
| `src/components/ui/button.jsx` | create | shadcn Button component |
| `src/components/ui/input.jsx` | create | shadcn Input component |
| `src/components/ui/card.jsx` | create | shadcn Card / CardContent components |
| `src/components/ui/badge.jsx` | create | shadcn Badge component (not the DumpIt wrapper) |
| `src/components/auth/LoginModal.jsx` | modify | use shadcn Button + Input |
| `src/components/dump/DumpInput.jsx` | modify | use shadcn Button |
| `src/components/tasks/TaskCard.jsx` | modify | use shadcn Card + CardContent |
| `package.json` | modify | add `clsx`, `tailwind-merge`, `class-variance-authority` dependencies |

> `src/components/ui/Badge.jsx` (capital B, the DumpIt wrapper) is **not** modified — it keeps its existing inline-style implementation.

## 6. Acceptance

- [ ] `components.json` committed, `npx shadcn@latest` does not error on subsequent runs.
- [ ] `src/lib/utils.js` exports a `cn()` function.
- [ ] shadcn `button.jsx`, `input.jsx`, `card.jsx`, `badge.jsx` present in `src/components/ui/`.
- [ ] `tailwind.config.js` references CSS variables for `primary`, `background`, `card`, `foreground`, `border`, `input`, `accent`, `muted`.
- [ ] `src/index.css` contains shadcn `:root` variable block with DumpIt token values.
- [ ] `LoginModal` renders with shadcn Input (focus ring uses `--primary`) and shadcn Button (`--primary` background).
- [ ] `DumpInput` "Dump ✦" button renders with `--brand`/`--primary` background via shadcn Button.
- [ ] `TaskCard` uses shadcn Card/CardContent; drag-and-drop still works (sort + reorder).
- [ ] Badge variants (urgente, normal, depois) display correct colours as before.
- [ ] `npm run lint` exits 0.
- [ ] `npm run build` exits 0 (no TypeScript errors, no missing imports).

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| shadcn init overwrites `tailwind.config.js` or `index.css` destructively | Run init on a clean branch, review diff before committing; DumpIt custom tokens are in a separate `:root` block |
| `clsx` / `tailwind-merge` / `cva` peer-dep conflicts with existing `eslint@10` | Install with `--legacy-peer-deps` (same pattern used for Framer Motion in #15) |
| DnD-kit + shadcn Card ref forwarding conflict | `<Card ref={setNodeRef}>` — shadcn Card is a plain `div` wrapper; ref forwarding works natively |
| HSL colour values differ visually from hex | Verify token mapping in dev preview before merging |

## 8. Rollout

Single PR, two logical commits:

1. `chore(#17): shadcn/ui init — components.json, tailwind config, CSS vars, utils` — setup only, no component changes.
2. `feat(#17): migrate Button, Input, Card call-sites to shadcn primitives` — all four component files modified.

After merge: no follow-up issues needed. Phase 3 (new shadcn components) is a separate issue if/when needed.

---

**Reviewer checklist:**

- Goals are achievable inside this PR.
- Non-goals are explicit; nothing snuck in.
- File list is complete.
- Acceptance criteria are objective.
